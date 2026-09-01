package controllers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/ameen36/microsoft-todo-clone/backend/database"
	"github.com/ameen36/microsoft-todo-clone/backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// =========================================================
// GET TASKS
// =========================================================

func GetTasks(c *gin.Context) {
	userID := c.MustGet("userId").(string)

	collection := database.Client.Database("todo").Collection("tasks")

	filter := bson.M{
		"userId": userID,
	}

	cursor, err := collection.Find(
		context.Background(),
		filter,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch tasks",
		})
		return
	}

	defer cursor.Close(context.Background())

	var tasks []models.Task

	if err := cursor.All(
		context.Background(),
		&tasks,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to decode tasks",
		})
		return
	}

	if tasks == nil {
		tasks = []models.Task{}
	}

	c.JSON(http.StatusOK, tasks)
}

// =========================================================
// CREATE TASK
// =========================================================

func CreateTask(c *gin.Context) {
	userID := c.MustGet("userId").(string)

	var task models.Task

	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	task.UserID = userID

	// Validate recurrence if provided.
	if task.Recurrence != nil &&
		task.Recurrence.Enabled {

		if err := validateRecurrence(
			task.Recurrence,
		); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		if task.Recurrence.Interval <= 0 {
			task.Recurrence.Interval = 1
		}
	}

	collection := database.Client.
		Database("todo").
		Collection("tasks")

	result, err := collection.InsertOne(
		context.Background(),
		task,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create task",
		})
		return
	}

	task.ID = result.InsertedID.(bson.ObjectID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Task created successfully",
		"task":    task,
	})
}

// =========================================================
// UPDATE TASK
// =========================================================

func UpdateTask(c *gin.Context) {
	userID := c.MustGet("userId").(string)

	id := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Task ID",
		})
		return
	}

	var task models.Task

	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Validate recurrence if provided.
	if task.Recurrence != nil &&
		task.Recurrence.Enabled {

		if err := validateRecurrence(
			task.Recurrence,
		); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		if task.Recurrence.Interval <= 0 {
			task.Recurrence.Interval = 1
		}
	}

	collection := database.Client.
		Database("todo").
		Collection("tasks")

	filter := bson.M{
		"_id":    objectID,
		"userId": userID,
	}

	// Update all task fields.
	//
	// Notes is included here so saving a note
	// actually persists it in MongoDB.
	update := bson.M{
		"$set": bson.M{
			"title":      task.Title,
			"completed":  task.Completed,
			"important":  task.Important,
			"dueDate":    task.DueDate,
			"priority":   task.Priority,
			"category":   task.Category,
			"notes":      task.Notes,
			"subTasks":   task.SubTasks,
			"recurrence": task.Recurrence,
		},
	}

	result, err := collection.UpdateOne(
		context.Background(),
		filter,
		update,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update task",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Task not found",
		})
		return
	}

	// Create the next occurrence only when
	// a recurring task is completed.
	if task.Completed &&
		task.Recurrence != nil &&
		task.Recurrence.Enabled &&
		task.DueDate != nil {

		err := createNextRecurringTask(
			context.Background(),
			collection,
			task,
			userID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Task was completed, but failed to create the next recurring task",
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task updated successfully",
	})
}

// =========================================================
// DELETE TASK
// =========================================================

func DeleteTask(c *gin.Context) {
	userID := c.MustGet("userId").(string)

	id := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Task ID",
		})
		return
	}

	collection := database.Client.
		Database("todo").
		Collection("tasks")

	filter := bson.M{
		"_id":    objectID,
		"userId": userID,
	}

	result, err := collection.DeleteOne(
		context.Background(),
		filter,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete task",
		})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Task not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task deleted successfully",
	})
}

// =========================================================
// RECURRING TASK HELPERS
// =========================================================

func validateRecurrence(
	recurrence *models.Recurrence,
) error {

	if recurrence == nil ||
		!recurrence.Enabled {
		return nil
	}

	switch recurrence.Frequency {

	case "Daily",
		"Weekly",
		"Monthly",
		"Yearly":
		return nil

	default:
		return fmt.Errorf(
			"invalid recurrence frequency: use Daily, Weekly, Monthly, or Yearly",
		)
	}
}

// =========================================================
// CREATE NEXT RECURRING TASK
// =========================================================

func createNextRecurringTask(
	ctx context.Context,
	collection *mongo.Collection,
	task models.Task,
	userID string,
) error {

	if task.Recurrence == nil ||
		!task.Recurrence.Enabled ||
		task.DueDate == nil {
		return nil
	}

	nextDueDate := calculateNextDueDate(
		*task.DueDate,
		task.Recurrence,
	)

	// Do not create another task if the
	// next occurrence is beyond the end date.
	if task.Recurrence.EndDate != nil &&
		nextDueDate.After(
			*task.Recurrence.EndDate,
		) {
		return nil
	}

	nextTask := models.Task{
		UserID:    userID,
		Title:     task.Title,
		Completed: false,
		Important: task.Important,
		DueDate:   &nextDueDate,
		Priority:  task.Priority,
		Category:  task.Category,
		Notes:     task.Notes,
		SubTasks:  nil,
		Recurrence: &models.Recurrence{
			Enabled:   task.Recurrence.Enabled,
			Frequency: task.Recurrence.Frequency,
			Interval:  task.Recurrence.Interval,

			DaysOfWeek: append(
				[]string{},
				task.Recurrence.DaysOfWeek...,
			),

			EndDate: task.Recurrence.EndDate,
		},
	}

	_, err := collection.InsertOne(
		ctx,
		nextTask,
	)

	return err
}

// =========================================================
// CALCULATE NEXT DUE DATE
// =========================================================

func calculateNextDueDate(
	current time.Time,
	recurrence *models.Recurrence,
) time.Time {

	interval := recurrence.Interval

	if interval <= 0 {
		interval = 1
	}

	switch recurrence.Frequency {

	case "Daily":
		return current.AddDate(
			0,
			0,
			interval,
		)

	case "Weekly":

		if len(recurrence.DaysOfWeek) > 0 {
			return nextWeeklyDate(
				current,
				recurrence.DaysOfWeek,
				interval,
			)
		}

		return current.AddDate(
			0,
			0,
			7*interval,
		)

	case "Monthly":
		return current.AddDate(
			0,
			interval,
			0,
		)

	case "Yearly":
		return current.AddDate(
			interval,
			0,
			0,
		)

	default:
		return current
	}
}

// =========================================================
// NEXT WEEKLY DATE
// =========================================================

func nextWeeklyDate(
	current time.Time,
	days []string,
	interval int,
) time.Time {

	weekdayMap := map[string]time.Weekday{
		"Sunday":    time.Sunday,
		"Monday":    time.Monday,
		"Tuesday":   time.Tuesday,
		"Wednesday": time.Wednesday,
		"Thursday":  time.Thursday,
		"Friday":    time.Friday,
		"Saturday":  time.Saturday,
	}

	allowed := make(
		map[time.Weekday]bool,
	)

	for _, day := range days {
		if weekday, ok := weekdayMap[day]; ok {
			allowed[weekday] = true
		}
	}

	// Find the next selected weekday.
	for i := 1; i <= 7; i++ {

		next := current.AddDate(
			0,
			0,
			i,
		)

		if allowed[next.Weekday()] {
			return next
		}
	}

	return current.AddDate(
		0,
		0,
		7*interval,
	)
}

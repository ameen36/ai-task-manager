package controllers

import (
	"context"
	"net/http"

	"github.com/ameen36/microsoft-todo-clone/backend/database"
	"github.com/ameen36/microsoft-todo-clone/backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func GetTasks(c *gin.Context) {

	userID := c.MustGet("userId").(string)

	collection := database.Client.Database("todo").Collection("tasks")

	filter := bson.M{
		"userId": userID,
	}

	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch tasks",
		})
		return
	}
	defer cursor.Close(context.Background())

	var tasks []models.Task

	if err := cursor.All(context.Background(), &tasks); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to decode tasks",
		})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

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

	collection := database.Client.Database("todo").Collection("tasks")

	_, err := collection.InsertOne(context.Background(), task)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create task",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Task created successfully",
	})
}

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

	collection := database.Client.Database("todo").Collection("tasks")

	filter := bson.M{
		"_id":    objectID,
		"userId": userID,
	}

	update := bson.M{
		"$set": bson.M{
			"title":     task.Title,
			"completed": task.Completed,
			"important": task.Important,
			"dueDate":   task.DueDate,
			"priority":  task.Priority,
			"category":  task.Category,
		},
	}

	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update task",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task updated successfully",
	})
}

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

	collection := database.Client.Database("todo").Collection("tasks")

	filter := bson.M{
		"_id":    objectID,
		"userId": userID,
	}

	_, err = collection.DeleteOne(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete task",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task deleted successfully",
	})
}

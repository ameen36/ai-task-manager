package controllers

import (
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/ameen36/microsoft-todo-clone/backend/database"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	uploadDirectory = "uploads"
	maxFileSize     = 10 << 20 // 10 MB
)

type Attachment struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TaskID       bson.ObjectID `bson:"taskId" json:"taskId"`
	UserID       string        `bson:"userId" json:"userId"`
	OriginalName string        `bson:"originalName" json:"originalName"`
	FileName     string        `bson:"fileName" json:"fileName"`
	ContentType  string        `bson:"contentType" json:"contentType"`
	Size         int64         `bson:"size" json:"size"`
	CreatedAt    time.Time     `bson:"createdAt" json:"createdAt"`
}

// =========================================================
// UPLOAD ATTACHMENT
// =========================================================

func UploadAttachment(c *gin.Context) {
	userID := c.MustGet("userId").(string)

	taskIDString := c.Param("id")

	taskID, err := bson.ObjectIDFromHex(taskIDString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Task ID",
		})
		return
	}

	// Verify that the task belongs to the logged-in user.
	tasksCollection := database.Client.
		Database("todo").
		Collection("tasks")

	var task bson.M

	err = tasksCollection.
		FindOne(
			c,
			bson.M{
				"_id":    taskID,
				"userId": userID,
			},
		).
		Decode(&task)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Task not found",
		})
		return
	}

	// Limit request size.
	c.Request.Body = http.MaxBytesReader(
		c.Writer,
		c.Request.Body,
		maxFileSize+1024*1024,
	)

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File is required",
		})
		return
	}

	defer file.Close()

	if header.Size > maxFileSize {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File size must be 10 MB or less",
		})
		return
	}

	if header.Filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid file name",
		})
		return
	}

	// Keep only the base filename.
	originalName := filepath.Base(header.Filename)

	// Prevent potentially dangerous path characters.
	originalName = strings.ReplaceAll(
		originalName,
		"\x00",
		"",
	)

	if originalName == "." ||
		originalName == ".." ||
		originalName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid file name",
		})
		return
	}

	// Create uploads directory if necessary.
	if err := os.MkdirAll(
		uploadDirectory,
		0755,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create upload directory",
		})
		return
	}

	attachmentID := bson.NewObjectID()

	extension := filepath.Ext(originalName)

	storedFileName := attachmentID.Hex() + extension

	filePath := filepath.Join(
		uploadDirectory,
		storedFileName,
	)

	destination, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create file",
		})
		return
	}

	defer destination.Close()

	written, err := copyFile(
		destination,
		file,
	)

	if err != nil {
		os.Remove(filePath)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file",
		})
		return
	}

	contentType := header.Header.Get("Content-Type")

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	attachment := Attachment{
		ID:           attachmentID,
		TaskID:       taskID,
		UserID:       userID,
		OriginalName: originalName,
		FileName:     storedFileName,
		ContentType:  contentType,
		Size:         written,
		CreatedAt:    time.Now(),
	}

	collection := database.Client.
		Database("todo").
		Collection("attachments")

	_, err = collection.InsertOne(
		c,
		attachment,
	)

	if err != nil {
		os.Remove(filePath)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save attachment information",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Attachment uploaded successfully",
		"attachment": attachment,
	})
}

// =========================================================
// GET ATTACHMENTS
// =========================================================

func GetAttachments(c *gin.Context) {
	userID := c.MustGet("userId").(string)

	taskIDString := c.Param("id")

	taskID, err := bson.ObjectIDFromHex(taskIDString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Task ID",
		})
		return
	}

	// Verify task ownership.
	tasksCollection := database.Client.
		Database("todo").
		Collection("tasks")

	var task bson.M

	err = tasksCollection.
		FindOne(
			c,
			bson.M{
				"_id":    taskID,
				"userId": userID,
			},
		).
		Decode(&task)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Task not found",
		})
		return
	}

	collection := database.Client.
		Database("todo").
		Collection("attachments")

	cursor, err := collection.Find(
		c,
		bson.M{
			"taskId": taskID,
			"userId": userID,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch attachments",
		})
		return
	}

	defer cursor.Close(c)

	var attachments []Attachment

	if err := cursor.All(
		c,
		&attachments,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to decode attachments",
		})
		return
	}

	if attachments == nil {
		attachments = []Attachment{}
	}

	c.JSON(http.StatusOK, attachments)
}

// =========================================================
// DOWNLOAD ATTACHMENT
// =========================================================

func DownloadAttachment(c *gin.Context) {
	userID := c.MustGet("userId").(string)

	taskIDString := c.Param("id")
	attachmentIDString := c.Param("attachmentId")

	taskID, err := bson.ObjectIDFromHex(taskIDString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Task ID",
		})
		return
	}

	attachmentID, err := bson.ObjectIDFromHex(
		attachmentIDString,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Attachment ID",
		})
		return
	}

	collection := database.Client.
		Database("todo").
		Collection("attachments")

	var attachment Attachment

	err = collection.
		FindOne(
			c,
			bson.M{
				"_id":    attachmentID,
				"taskId": taskID,
				"userId": userID,
			},
		).
		Decode(&attachment)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Attachment not found",
		})
		return
	}

	filePath := filepath.Join(
		uploadDirectory,
		attachment.FileName,
	)

	if _, err := os.Stat(filePath); err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Attachment file not found",
		})
		return
	}

	disposition := mime.FormatMediaType(
		"attachment",
		map[string]string{
			"filename": attachment.OriginalName,
		},
	)

	c.Header(
		"Content-Disposition",
		disposition,
	)

	c.Header(
		"Content-Type",
		attachment.ContentType,
	)

	c.File(filePath)
}

// =========================================================
// DELETE ATTACHMENT
// =========================================================

func DeleteAttachment(c *gin.Context) {
	userID := c.MustGet("userId").(string)

	taskIDString := c.Param("id")
	attachmentIDString := c.Param("attachmentId")

	taskID, err := bson.ObjectIDFromHex(taskIDString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Task ID",
		})
		return
	}

	attachmentID, err := bson.ObjectIDFromHex(
		attachmentIDString,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Attachment ID",
		})
		return
	}

	collection := database.Client.
		Database("todo").
		Collection("attachments")

	var attachment Attachment

	err = collection.
		FindOne(
			c,
			bson.M{
				"_id":    attachmentID,
				"taskId": taskID,
				"userId": userID,
			},
		).
		Decode(&attachment)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Attachment not found",
		})
		return
	}

	filePath := filepath.Join(
		uploadDirectory,
		attachment.FileName,
	)

	// Delete the physical file.
	if err := os.Remove(filePath); err != nil &&
		!os.IsNotExist(err) {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete attachment file",
		})
		return
	}

	_, err = collection.DeleteOne(
		c,
		bson.M{
			"_id":    attachmentID,
			"taskId": taskID,
			"userId": userID,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete attachment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Attachment deleted successfully",
	})
}

// =========================================================
// FILE COPY HELPER
// =========================================================

func copyFile(
	destination *os.File,
	source interface {
		Read([]byte) (int, error)
	},
) (int64, error) {

	buffer := make([]byte, 32*1024)

	var total int64

	for {
		n, readErr := source.Read(buffer)

		if n > 0 {
			written, writeErr := destination.Write(
				buffer[:n],
			)

			if writeErr != nil {
				return total, writeErr
			}

			total += int64(written)

			if written != n {
				return total, fmt.Errorf(
					"short write",
				)
			}
		}

		if readErr != nil {
			if readErr.Error() == "EOF" {
				return total, nil
			}

			return total, readErr
		}
	}
}

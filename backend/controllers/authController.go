package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/ameen36/microsoft-todo-clone/backend/database"
	"github.com/ameen36/microsoft-todo-clone/backend/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("super-secret-key")

func Register(c *gin.Context) {

	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	collection := database.Client.Database("todo").Collection("users")

	var existingUser models.User

	err := collection.FindOne(
		context.Background(),
		bson.M{"email": user.Email},
	).Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email already registered",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(user.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to hash password",
		})
		return
	}

	user.Password = string(hashedPassword)

	_, err = collection.InsertOne(context.Background(), user)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to register user",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
	})
}

func Login(c *gin.Context) {

	var loginUser models.User

	if err := c.ShouldBindJSON(&loginUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	collection := database.Client.Database("todo").Collection("users")

	var existingUser models.User

	err := collection.FindOne(
		context.Background(),
		bson.M{"email": loginUser.Email},
	).Decode(&existingUser)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(existingUser.Password),
		[]byte(loginUser.Password),
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": existingUser.ID.Hex(),
		"email":  existingUser.Email,
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(jwtKey)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   tokenString,
	})
}

func GetProfile(c *gin.Context) {

	userID := c.MustGet("userId").(string)

	objectID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	collection := database.Client.Database("todo").Collection("users")

	var user models.User

	err = collection.FindOne(
		context.Background(),
		bson.M{
			"_id": objectID,
		},
	).Decode(&user)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID.Hex(),
		"name":  user.Name,
		"email": user.Email,
	})
}
func UpdateProfile(c *gin.Context) {

	userID := c.MustGet("userId").(string)

	objectID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	var updatedUser models.User

	if err := c.ShouldBindJSON(&updatedUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	collection := database.Client.Database("todo").Collection("users")

	update := bson.M{
		"$set": bson.M{
			"name":  updatedUser.Name,
			"email": updatedUser.Email,
		},
	}

	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		update,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update profile",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
	})
}

func ChangePassword(c *gin.Context) {

	userID := c.MustGet("userId").(string)

	objectID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	var request struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})
		return
	}

	if request.CurrentPassword == "" || request.NewPassword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Current password and new password are required",
		})
		return
	}

	if len(request.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "New password must be at least 8 characters",
		})
		return
	}

	collection := database.Client.Database("todo").Collection("users")

	var user models.User

	err = collection.FindOne(
		context.Background(),
		bson.M{"_id": objectID},
	).Decode(&user)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(request.CurrentPassword),
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Current password is incorrect",
		})
		return
	}

	if request.CurrentPassword == request.NewPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "New password must be different from current password",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(request.NewPassword),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process new password",
		})
		return
	}

	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{
			"$set": bson.M{
				"password": string(hashedPassword),
			},
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to change password",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password changed successfully",
	})
}

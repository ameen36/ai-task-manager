package controllers

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/ameen36/microsoft-todo-clone/backend/database"
	"github.com/ameen36/microsoft-todo-clone/backend/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("super-secret-key")

// =========================================================
// REGISTER
// =========================================================

func Register(c *gin.Context) {

	var request struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})
		return
	}

	request.Name = strings.TrimSpace(request.Name)
	request.Email = strings.ToLower(strings.TrimSpace(request.Email))

	if request.Name == "" ||
		request.Email == "" ||
		request.Password == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Name, email and password are required",
		})
		return
	}

	if len(request.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password must be at least 8 characters",
		})
		return
	}

	collection := database.Client.Database("todo").Collection("users")

	// Check whether email already exists.
	var existingUser models.User

	err := collection.FindOne(
		context.Background(),
		bson.M{
			"email": request.Email,
		},
	).Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email already registered",
		})
		return
	}

	// Hash password.
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(request.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to hash password",
		})
		return
	}

	user := models.User{
		Name:     request.Name,
		Email:    request.Email,
		Password: string(hashedPassword),
	}

	_, err = collection.InsertOne(
		context.Background(),
		user,
	)

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

// =========================================================
// LOGIN
// =========================================================

func Login(c *gin.Context) {

	// IMPORTANT:
	// Do NOT bind login data directly into models.User.
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid login request",
		})

		return
	}

	// Normalize email.
	request.Email = strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	// Validate credentials.
	if request.Email == "" || request.Password == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email and password are required",
		})

		return
	}

	collection := database.Client.Database("todo").Collection("users")

	var user models.User

	// Find user by email.
	err := collection.FindOne(
		context.Background(),
		bson.M{
			"email": request.Email,
		},
	).Decode(&user)

	if err != nil {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})

		return
	}

	// Compare entered password with bcrypt password
	// stored in MongoDB.
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(request.Password),
	)

	if err != nil {

		// Keep actual bcrypt error on the backend only.
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})

		return
	}

	// Create JWT.
	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"userId": user.ID.Hex(),
			"email":  user.Email,
			"exp": time.Now().
				Add(24 * time.Hour).
				Unix(),
		},
	)

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
		"user": gin.H{
			"id":    user.ID.Hex(),
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

// =========================================================
// GET PROFILE
// =========================================================

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

// =========================================================
// UPDATE PROFILE
// =========================================================

func UpdateProfile(c *gin.Context) {

	userID := c.MustGet("userId").(string)

	objectID, err := bson.ObjectIDFromHex(userID)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})

		return
	}

	var request struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	request.Name = strings.TrimSpace(request.Name)

	request.Email = strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	if request.Name == "" || request.Email == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Name and email are required",
		})

		return
	}

	collection := database.Client.Database("todo").Collection("users")

	update := bson.M{
		"$set": bson.M{
			"name":  request.Name,
			"email": request.Email,
		},
	}

	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{
			"_id": objectID,
		},
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

// =========================================================
// CHANGE PASSWORD
// =========================================================

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

	if request.CurrentPassword == "" ||
		request.NewPassword == "" {

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

	if request.CurrentPassword == request.NewPassword {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "New password must be different from current password",
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

	// Verify current password.
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

	// Hash new password.
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
		bson.M{
			"_id": objectID,
		},
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

// =========================================================
// FORGOT PASSWORD
// =========================================================

func ForgotPassword(c *gin.Context) {

	var request struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	request.Email = strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	if request.Email == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email is required",
		})

		return
	}

	collection := database.Client.Database("todo").Collection("users")

	var user models.User

	err := collection.FindOne(
		context.Background(),
		bson.M{
			"email": request.Email,
		},
	).Decode(&user)

	// Don't reveal whether the email exists.
	if err != nil {

		c.JSON(http.StatusOK, gin.H{
			"message": "If an account exists with that email, a password reset link will be sent.",
		})

		return
	}

	// Generate secure random token.
	tokenBytes := make([]byte, 32)

	_, err = rand.Read(tokenBytes)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate reset token",
		})

		return
	}

	resetToken := hex.EncodeToString(tokenBytes)

	// Hash token before storing it.
	tokenHash := sha256.Sum256(
		[]byte(resetToken),
	)

	hashedResetToken := hex.EncodeToString(
		tokenHash[:],
	)

	// Token expires after 15 minutes.
	expiry := time.Now().Add(
		15 * time.Minute,
	)

	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{
			"_id": user.ID,
		},
		bson.M{
			"$set": bson.M{
				"resetToken":       hashedResetToken,
				"resetTokenExpiry": expiry,
			},
		},
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create password reset request",
		})

		return
	}

	// Development mode.
	// Returns token so local testing is possible.
	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset token generated.",
		"token":   resetToken,
	})
}

// =========================================================
// RESET PASSWORD
// =========================================================

func ResetPassword(c *gin.Context) {

	var request struct {
		Token       string `json:"token"`
		NewPassword string `json:"newPassword"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	request.Token = strings.TrimSpace(request.Token)

	if request.Token == "" ||
		request.NewPassword == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Reset token and new password are required",
		})

		return
	}

	if len(request.NewPassword) < 8 {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "New password must be at least 8 characters",
		})

		return
	}

	// Hash token received from frontend.
	tokenHash := sha256.Sum256(
		[]byte(request.Token),
	)

	hashedToken := hex.EncodeToString(
		tokenHash[:],
	)

	collection := database.Client.Database("todo").Collection("users")

	var user models.User

	// Find user using token and expiry.
	err := collection.FindOne(
		context.Background(),
		bson.M{
			"resetToken": hashedToken,
			"resetTokenExpiry": bson.M{
				"$gt": time.Now(),
			},
		},
	).Decode(&user)

	if err != nil {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid or expired reset token",
		})

		return
	}

	// Hash new password.
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

	// Update password and remove reset token.
	result, err := collection.UpdateOne(
		context.Background(),
		bson.M{
			"_id": user.ID,
		},
		bson.M{
			"$set": bson.M{
				"password": string(hashedPassword),
			},
			"$unset": bson.M{
				"resetToken":       "",
				"resetTokenExpiry": "",
			},
		},
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to reset password",
		})

		return
	}

	if result.MatchedCount == 0 {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "User password was not updated",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully",
	})
}

package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID       bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name     string        `bson:"name" json:"name"`
	Email    string        `bson:"email" json:"email"`
	Password string        `bson:"password,omitempty" json:"-"`

	ResetToken       string    `bson:"resetToken,omitempty" json:"-"`
	ResetTokenExpiry time.Time `bson:"resetTokenExpiry,omitempty" json:"-"`
}
package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type SubTask struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Title     string        `bson:"title" json:"title"`
	Completed bool          `bson:"completed" json:"completed"`
}

type Task struct {
	ID     bson.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID string        `bson:"userId" json:"userId"`

	Title     string `bson:"title" json:"title"`
	Completed bool   `bson:"completed" json:"completed"`
	Important bool   `bson:"important" json:"important"`

	DueDate  *time.Time `bson:"dueDate,omitempty" json:"dueDate,omitempty"`
	Priority string     `bson:"priority,omitempty" json:"priority,omitempty"`
	Category string     `bson:"category,omitempty" json:"category,omitempty"`

	SubTasks []SubTask `bson:"subTasks,omitempty" json:"subTasks,omitempty"`
}

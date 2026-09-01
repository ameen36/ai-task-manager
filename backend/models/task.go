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

// Recurrence defines how a task repeats.
type Recurrence struct {
	Enabled    bool       `bson:"enabled" json:"enabled"`
	Frequency  string     `bson:"frequency,omitempty" json:"frequency,omitempty"`
	Interval   int        `bson:"interval,omitempty" json:"interval,omitempty"`
	DaysOfWeek []string   `bson:"daysOfWeek,omitempty" json:"daysOfWeek,omitempty"`
	EndDate    *time.Time `bson:"endDate,omitempty" json:"endDate,omitempty"`
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

	// Notes contains additional information about the task.
	Notes string `bson:"notes,omitempty" json:"notes,omitempty"`

	SubTasks []SubTask `bson:"subTasks,omitempty" json:"subTasks,omitempty"`

	Recurrence *Recurrence `bson:"recurrence,omitempty" json:"recurrence,omitempty"`
}

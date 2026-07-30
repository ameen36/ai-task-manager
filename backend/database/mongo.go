package database

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var Client *mongo.Client

func ConnectDB() {

	uri := "mongodb+srv://ameen:Ameen313313@cluster0.uvy5ppa.mongodb.net/todo?retryWrites=true&w=majority"
	client, err := mongo.Connect(
		options.Client().ApplyURI(uri),
	)
	if err != nil {
		panic(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Ping(ctx, nil)
	if err != nil {
		panic(err)
	}

	fmt.Println("✅ Connected to MongoDB Atlas!")

	Client = client
}

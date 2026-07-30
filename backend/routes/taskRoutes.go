package routes

import (
	"github.com/ameen36/microsoft-todo-clone/backend/controllers"
	"github.com/ameen36/microsoft-todo-clone/backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupTaskRoutes(router *gin.Engine) {

	taskRoutes := router.Group("/tasks")
	taskRoutes.Use(middleware.AuthMiddleware())

	taskRoutes.GET("", controllers.GetTasks)
	taskRoutes.POST("", controllers.CreateTask)
	taskRoutes.PUT("/:id", controllers.UpdateTask)
	taskRoutes.DELETE("/:id", controllers.DeleteTask)
}

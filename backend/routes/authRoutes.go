package routes

import (
	"github.com/ameen36/microsoft-todo-clone/backend/controllers"
	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(router *gin.Engine) {
	router.POST("/register", controllers.Register)
	router.POST("/login", controllers.Login)
}

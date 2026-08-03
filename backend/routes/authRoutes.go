package routes

import (
	"github.com/ameen36/microsoft-todo-clone/backend/controllers"
	"github.com/ameen36/microsoft-todo-clone/backend/middleware"
	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(router *gin.Engine) {

	router.POST("/register", controllers.Register)
	router.POST("/login", controllers.Login)

	router.GET(
		"/profile",
		middleware.AuthMiddleware(),
		controllers.GetProfile,
	)

	router.PUT(
		"/profile",
		middleware.AuthMiddleware(),
		controllers.UpdateProfile,
	)

	router.PUT(
		"/change-password",
		middleware.AuthMiddleware(),
		controllers.ChangePassword,
	)
}

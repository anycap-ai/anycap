package middleware

import (
	"context"
	"net/http"
	"strings"
	"sync"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

const capabilityKey = "capability"

var capabilityRoutes = newCapabilityRouteRegistry()

type capabilityRouteRegistry struct {
	mu     sync.RWMutex
	routes map[string]string
}

func newCapabilityRouteRegistry() *capabilityRouteRegistry {
	return &capabilityRouteRegistry{
		routes: make(map[string]string),
	}
}

func SetCapability(ctx *app.RequestContext, capability string) {
	ctx.Set(capabilityKey, capability)
}

func GetCapability(ctx *app.RequestContext) (string, bool) {
	value, ok := ctx.Get(capabilityKey)
	if !ok {
		return "", false
	}

	capability, ok := value.(string)
	if !ok || capability == "" {
		return "", false
	}
	return capability, true
}

func ResolveCapability(ctx *app.RequestContext) (string, bool) {
	if capability, ok := GetCapability(ctx); ok {
		return capability, true
	}

	return capabilityRoutes.lookup(string(ctx.Method()), ctx.FullPath())
}

func WithCapability(name string) app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		if name != "" {
			SetCapability(c, name)
		}
		c.Next(ctx)
	}
}

func CapabilityGET(group *route.RouterGroup, relativePath, capability string, handlers ...app.HandlerFunc) route.IRoutes {
	return capabilityRoute(group, http.MethodGet, relativePath, capability, handlers...)
}

func CapabilityPOST(group *route.RouterGroup, relativePath, capability string, handlers ...app.HandlerFunc) route.IRoutes {
	return capabilityRoute(group, http.MethodPost, relativePath, capability, handlers...)
}

func CapabilityPUT(group *route.RouterGroup, relativePath, capability string, handlers ...app.HandlerFunc) route.IRoutes {
	return capabilityRoute(group, http.MethodPut, relativePath, capability, handlers...)
}

func CapabilityPATCH(group *route.RouterGroup, relativePath, capability string, handlers ...app.HandlerFunc) route.IRoutes {
	return capabilityRoute(group, http.MethodPatch, relativePath, capability, handlers...)
}

func CapabilityDELETE(group *route.RouterGroup, relativePath, capability string, handlers ...app.HandlerFunc) route.IRoutes {
	return capabilityRoute(group, http.MethodDelete, relativePath, capability, handlers...)
}

func capabilityRoute(group *route.RouterGroup, method, relativePath, capability string, handlers ...app.HandlerFunc) route.IRoutes {
	capabilityRoutes.register(method, joinRoutePath(group.BasePath(), relativePath), capability)

	switch strings.ToUpper(method) {
	case http.MethodGet:
		return group.GET(relativePath, handlers...)
	case http.MethodPost:
		return group.POST(relativePath, handlers...)
	case http.MethodPut:
		return group.PUT(relativePath, handlers...)
	case http.MethodPatch:
		return group.PATCH(relativePath, handlers...)
	case http.MethodDelete:
		return group.DELETE(relativePath, handlers...)
	default:
		panic("unsupported capability route method: " + method)
	}
}

func joinRoutePath(basePath, relativePath string) string {
	if basePath == "" || basePath == "/" {
		basePath = ""
	} else {
		basePath = strings.TrimRight(basePath, "/")
	}

	if relativePath == "" || relativePath == "/" {
		if basePath == "" {
			return "/"
		}
		return basePath
	}

	if !strings.HasPrefix(relativePath, "/") {
		relativePath = "/" + relativePath
	}

	if basePath == "" {
		return relativePath
	}
	return basePath + relativePath
}

func routeCapabilityKey(method, fullPath string) string {
	return strings.ToUpper(method) + " " + fullPath
}

func (r *capabilityRouteRegistry) register(method, fullPath, capability string) {
	if capability == "" || fullPath == "" {
		return
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.routes[routeCapabilityKey(method, fullPath)] = capability
}

func (r *capabilityRouteRegistry) lookup(method, fullPath string) (string, bool) {
	if fullPath == "" {
		return "", false
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	capability, ok := r.routes[routeCapabilityKey(method, fullPath)]
	if !ok || capability == "" {
		return "", false
	}
	return capability, true
}

import { Outlet, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  Home, PlusCircle, Search, ClipboardList,
  Users, LogOut, Building2, Terminal, CheckCircle2, ShoppingBag,
  UserPlus, User, BarChart3,Info
} from "lucide-react";

const menuByRole = {
  admin: [
    { title: "Analytics", url: "/admin", icon: BarChart3 },
    { title: "Properties", url: "/admin/properties", icon: Building2 },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Add Agent", url: "/admin/add-agent", icon: UserPlus },
    { title: "SQL Console", url: "/admin/sql", icon: Terminal },
    { title: "About", url: "/admin/about", icon: Info },
  ],
  owner: [
    { title: "My Properties", url: "/owner", icon: Home },
    { title: "Add Property", url: "/owner/add", icon: PlusCircle },
    { title: "Sold Properties", url: "/owner/sold", icon: CheckCircle2 },
  ],
  buyer: [
    { title: "Browse Properties", url: "/buyer", icon: Search },
    { title: "My Requests", url: "/buyer/requests", icon: ClipboardList },
    { title: "Purchased Properties", url: "/buyer/purchased", icon: ShoppingBag },
  ],
  agent: [
    { title: "Property Requests", url: "/agent", icon: ClipboardList },
    { title: "My Properties", url: "/agent/properties", icon: Building2 },
    { title: "Profile", url: "/agent/profile", icon: User },
  ],
};

function SidebarNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const items = menuByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full bg-sidebar">
        <motion.div
          className="p-4 border-b border-sidebar-border"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Building2 className="h-5 w-5 text-primary" />
            </motion.div>
            {!collapsed && (
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
                RealEstate<span className="text-primary">Company</span>
              </span>
            )}
          </Link>
        </motion.div>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 + 0.2, duration: 0.3 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        activeClassName="bg-sidebar-accent text-primary font-semibold"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-sidebar-border">
          {!collapsed && user && (
            <motion.div
              className="mb-3 rounded-xl bg-sidebar-accent/50 p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase"
                  whileHover={{ scale: 1.1 }}
                >
                  {(user.name || user.email || "U").slice(0, 2)}
                </motion.div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">{user.name || user.email}</p>
                  <p className="text-[10px] uppercase tracking-wider text-primary font-medium">{user.role}</p>
                </div>
              </div>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              className="w-full rounded-xl text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Logout</span>}
            </Button>
          </motion.div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col">
          <motion.header
            className="h-16 flex items-center border-b border-border/50 bg-card/30 backdrop-blur-md px-6 gap-4 sticky top-0 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SidebarTrigger className="text-foreground/60 hover:text-foreground transition-colors" />
            <div className="h-6 w-px bg-border/50" />
            <h1 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {user?.role} Dashboard
            </h1>
          </motion.header>
          <main className="flex-1 p-6 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

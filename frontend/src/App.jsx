import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Items from "./pages/Items";
import MyListings from "./pages/MyListings"
import About from "./pages/About";
import CreateListing from "./pages/CreateListings";
import NotFound from "./pages/NotFound";
import EditItem from "./pages/EditItem";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/item/:id" element={<Items/>}/>
        <Route path="/my-listings" element={
          <ProtectedRoute>
            <MyListings/>
          </ProtectedRoute>
        }/>
        <Route path="/about" element={<About/>}/>
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route path="/item/:id/edit" element={
          <ProtectedRoute>
            <EditItem />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

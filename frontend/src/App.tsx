import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import TextArea from "./TextArea";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Group from "./Group";

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="my-4 mx-7">
          <Navbar />
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/chat" element={<TextArea />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/groupchat" element={<Group />} />
          </Routes>
          <hr />
          <Footer />
          <ToastContainer />
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;

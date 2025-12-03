import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchFlight from "./pages/SearchFlight";
import FlightResults from "./pages/FlightResults";
import FlightBooking from "./pages/FlightBooking";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SearchFlight />} />
          <Route path="/results" element={<FlightResults />} />
          <Route path="/booking" element={<FlightBooking />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

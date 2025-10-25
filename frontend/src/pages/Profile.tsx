import React from "react";
import profilePic from "../assets/profile.jpg";
import "../css/Profile.css";
export default function Profile() {
  const user = {
    name: "Sai Sasank Achanta",
    username: "@SasnakAchanta",
    age: 19,

    bio: "I like games",
    email: "sasank.achanta06@gmail.com",
    favoriteBook: "Harry Potter and the Sorcerer's Stone",
    location: "United States",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-gray-800 w-80 rounded-xl shadow-md p-6 text-center">
        {/* Profile Picture */}
        <img
          src={profilePic}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
        <div className="text-white">N/A</div>

        {/* User Info */}
        <h1 className="text-xl font-semibold text-white">{user.name}</h1>
        <p className="text-gray-300">{user.username}</p>

        <div className="text-white">
          <p>{user.age}</p>
          <p>{user.location}</p>
          <p>{user.favoriteBook}</p>
        </div>
      </div>
    </div>
  );
}

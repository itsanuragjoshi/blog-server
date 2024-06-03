// Import necessary functions from the Firebase SDK
import { initializeApp } from "firebase/app"; // Import function to initialize Firebase app
import { getStorage } from "firebase/storage"; // Import function to get Firebase storage service

// Import dotenv package for environment variable configuration
import dotenv from "dotenv";

// Load environment variables from a .env file
dotenv.config();

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY, // Firebase API key from environment variables
    authDomain: process.env.FIREBASE_AUTHDOMAIN, // Firebase Auth domain from environment variables
    projectId: process.env.FIREBASE_PROJECTID, // Firebase project ID from environment variables
    storageBucket: process.env.FIREBASE_STORAGEBUCKET, // Firebase storage bucket from environment variables
    messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID, // Firebase messaging sender ID from environment variables
    appId: process.env.FIREBASE_APPID // Firebase app ID from environment variables
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig); // Initialize Firebase app with configuration

// Get a reference to the Firebase storage service
const firebaseStorage = getStorage(firebaseApp); // Get storage service from the initialized app

// Export the storage service for use in other parts of your application
export default firebaseStorage;

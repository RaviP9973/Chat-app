import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Create MongoDB client connection for better-auth
const client = new MongoClient(process.env.MONGODB_URL);

async function getMongoDatabase() {
    await client.connect();
    const db = client.db("Chat-app");
    console.log("MongoDB client connected for better-auth");
    return db;
}

export const auth = betterAuth({
    database: mongodbAdapter(await getMongoDatabase()),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.VITE_SERVER_URL,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        google: { 
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID , 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectURI: `${process.env.VITE_SERVER_URL}/api/auth/callback/google`,
        }, 
    },
    trustedOrigins: [process.env.ORIGIN],
    user: {
        modelName: "users",
        additionalFields: {
            profileSetup: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: true,
                returned: true
            },
            firstName: {
                type: "string",
                required: false,
                input: true,
                returned: true
            },
            lastName: {
                type: "string",
                required: false,
                input: true,
                returned: true
            },
            color: {
                type: "number",
                required: false,
                input: true,
                returned: true
            },
            image: {
                type: "string",
                required: false,
                input: true,
                returned: true
            }
        }
    }
});
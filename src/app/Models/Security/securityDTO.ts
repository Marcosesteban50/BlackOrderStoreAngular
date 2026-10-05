// Credentials sent when registering or logging in
export interface UserCredentialsDTO {

    // User email
    email: string;

    // User password
    password: string;
}


// Response returned by the API after authentication
export interface AuthResponseDTO {

    // JWT used for authentication
    token: string;

    // Date when the JWT expires
    expiration: string;

    // Optional user information
    usuario?: {

        // User email
        email: string;

        // User name
        name: string;

        // User profile picture
        picture: string;
    };
}


// Data sent from the contact form
export interface ContactDTO {

    // Sender name
    nombre: string;

    // Sender email
    correo: string;

    // Email subject
    asunto: string;

    // Email message
    mensaje: string;
}


// Basic user information
export interface UserDTO {

    // User email
    email: string;

    // User roles
    roles?: string[];
}


// ==============================
// GOOGLE LOGIN
// ==============================

// Token received from Google and sent to our API
export interface GoogleLoginRequestDTO {

    // Google ID token
    token: string;
}


// Complete response returned after Google Login
export interface AuthResponseFullDTO extends AuthResponseDTO {

    // Google user information
    usuario: {

        // User email
        email: string;

        // User name
        name: string;

        // Google profile picture
        picture: string;

        // Google account ID
        googleId?: string;
    };
}


// User information stored in the frontend
export interface UserInfo {

    // User email
    email: string;

    // User name
    name: string;

    // User profile picture
    picture: string;

    // User roles
    roles: string[];
}
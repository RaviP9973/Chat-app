export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES = "api/users";
export const CONTACT_ROUTES = "api/contacts";
export const MESSAGES_ROUTES = "api/messages";


//Auth routes
export const SIGNUP_ROUTES = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTES = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO = `${AUTH_ROUTES}/userInfo`;
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/update-profile`;
export const REMOVE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/remove-profile-image`;
export const ADD_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/add-profile-image`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;





// Contacts Routes
export const SEARCH_CONTACTS_ROUTE = `${CONTACT_ROUTES}/search`;
export const GET_DM_CONTACTS_ROUTE = `${CONTACT_ROUTES}/get-contacts-for-dm`;
export const GET_ALL_CONTACTS_ROUTE = `${CONTACT_ROUTES}/get-all-contacts`;




//Messages Routes
export const GET_ALL_MESSAGES_ROUTE = `${MESSAGES_ROUTES}/get-messages`;
export const UPLOAD_FILE_ROUTE = `${MESSAGES_ROUTES}/upload-file`;
export const DELETE_MESSAGE_ROUTE = `${MESSAGES_ROUTES}/delete-message`;



// channel Routes
export const CHANNEL_ROUTES = "api/channel";
export const CREATE_CHANNEL_ROUTE = `${CHANNEL_ROUTES}/create-channel`;
export const GET_USER_CHANNELS_ROUTE = `${CHANNEL_ROUTES}/get-user-channels`;
export const GET_CHANNEL_MESSAGES_ROUTE = `${CHANNEL_ROUTES}/get-channel-messages`;
export const ADD_MEMBER_TO_CHANNEL_ROUTE = `${CHANNEL_ROUTES}/add-member-to-channel`;
import { Router } from 'express';
import { verifyToken } from '../middleware/AtuhMiddleware.js';
import { getAllContacts, getContactsForDmList, searchContacts } from '../controllers/ContactsController.js';


const contactRoute = Router();

contactRoute.post('/search', verifyToken, searchContacts)

contactRoute.get("/get-contacts-for-dm", verifyToken, getContactsForDmList)
contactRoute.get("/get-all-contacts", verifyToken, getAllContacts)

export default contactRoute;
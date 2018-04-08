import * as types from './actionTypes'
import firebaseService from '../../services/firebase'

const FIREBASE_REF_MESSAGES = firebaseService.database().ref('Messages')
const FIREBASE_REF_MESSAGES_LIMIT = 20
var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze";
var subscriptionKey = "763cb73c3b9b4b40acde83fa7d18e693";

// get all possible data
var qString = "?visualFeatures=Categories,Tags,Description,Faces,ImageType,Color,Adult&language=en&details=Celebrities,Landmarks";


function processImage(sourceImageUrl) {

	var r = new XMLHttpRequest();
	r.open("POST", uriBase, true);

	r.setRequestHeader("Content-Type","application/json");
	r.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);

	var data = '{"url": ' + '"' + sourceImageUrl + qString + '"}';

	r.send(data);
   
	return r.responseText;

}
export const sendMessage = message => {
  return (dispatch) => {
   dispatch(chatMessageLoading())
      var lll = processImage(message)
    if (lll != undefined) {
        let currentUser = firebaseService.auth().currentUser
        let createdAt = new Date().getTime()
        let chatMessage = {
            text: lll,
            createdAt: createdAt,
            user: {
                id: currentUser.uid,
                email: currentUser.email
            }
        }

        FIREBASE_REF_MESSAGES.push().set(chatMessage, (error) => {
            if (error) {
                dispatch(chatMessageError(error.message))
            } else {
                dispatch(chatMessageSuccess())
            }
        })
    }
  }
}

export const updateMessage = text => {
  return (dispatch) => {
    dispatch(chatUpdateMessage(text))
  }
}

export const loadMessages = () => {
  return (dispatch) => {
    FIREBASE_REF_MESSAGES.limitToLast(FIREBASE_REF_MESSAGES_LIMIT).on('value', (snapshot) => {
      dispatch(loadMessagesSuccess(snapshot.val()))
    }, (errorObject) => {
      dispatch(loadMessagesError(errorObject.message))
    })
  }
}

const chatMessageLoading = () => ({
  type: types.CHAT_MESSAGE_LOADING
})

const chatMessageSuccess = () => ({
  type: types.CHAT_MESSAGE_SUCCESS
})

const chatMessageError = error => ({
  type: types.CHAT_MESSAGE_ERROR,
  error
})

const chatUpdateMessage = text => ({
  type: types.CHAT_MESSAGE_UPDATE,
  text
})

const loadMessagesSuccess = messages => ({
  type: types.CHAT_LOAD_MESSAGES_SUCCESS,
  messages
})

const loadMessagesError = error => ({
  type: types.CHAT_LOAD_MESSAGES_ERROR,
  error
})

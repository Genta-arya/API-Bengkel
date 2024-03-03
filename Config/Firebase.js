import pkg from "firebase-admin";


const serviceAccountRaw = {
    "type": "service_account",
    "project_id": "bengkel-fdf57",
    "private_key_id": "9e8f9c264b3b5a0f299765b90c3d1c72c6acfef0",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQC3RbKoLoNRNDd1\nDfPjD4oxOgh4iwdvEUy0yCWBkRP1d1YUpdsMSXFNfxZZC9bKkv28HD7pjHqsYBl4\n/mTev6UJFXt/GOpkMaY5uMl1p2tHQB99UOcZBPkRWcHPNQdQP8etsZzuLiyDIzZx\nhfstpa6Qyw1MVRfkAG5TtvfV8zxqODE6bsgrttACn/pbAxEjJMrfAX1/w8cQjObu\nQ905C8Vd9mz0oxcDPSUvu1u1GW4TW+ScN8cJQ3pEQ2gNuRa0ty8sglQpZRCWs/uq\nqOEdWpYQ9WP/iz5OxAP0QXil6IbvoRprhdKzFBi5/fOudlRrBdcqaThUmXOaYw3a\n0ITKAAmpAgMBAAECgf9xaO/lTY3KnPAJv1iXFEavr6Rjnk+Qq2PhevkP9HbQBHOA\nKMzOuE56EOquBRAldaW412xsREH6k9KEzOdz76PGEJpwoTpqRfmsPm0Wy+3WvsIT\nChKiU4bM9dNjewJ2O6w/ZRQh+kYRNaO7HEMSkYmJ5XI/32hT7vBWss0qgsTKn8O0\n5W9orw+Xy3DeDA/q5pfj2voRYIVCGSGyk1q1kZ0KUmxIytEDiyCqh2DXaypBc4L2\n9ESyVMerA9PHkDttlidWGnw41VrPGoTMKKpBkeqO2owrAFQ34OzubpQyldNjLn4w\ndoQYyFHUbl2BA3DwgGXqHDwDyVY3Vi7DgA93dV0CgYEA6RmqFVGqgWtt9OvbiCLd\n3x8kgT2nTLEDrY4+Z+VfFeqj9m7tTyR7j1M0yugLZs5Pop68XacHuV1tlPxc1jO/\nrDMdCdH6pU1RUVcY8vRT9K6PwJav2g6CH1STk5tqidr47jwKpEjmue/idh9LEsL5\nkVnoYPA0mlU8Dfgq+Xgxfl0CgYEAyUbjcVChkM2QgIa9iEAIsAbHyeHtM7lvi9n2\nj6pBGrzRyBe+gXveT1ycClg5Pt/cSe/NLmz7BF7ifZ4g2Gu2mu9IwpxjbViJDd6n\njq9P4STSjBPNy5bIDq1gT3yxZK7Wa/TWjpq2mGEzjL8r4kEe/AS9eEAikEbkXmS1\nLi8qy70CgYEAwGr6Fr0iRdE7pEkqIDe/9RYNGU6ektUwlwzrgPI7yqi1jpDE/ma8\nRHTICJMCDmxSGoh0L87YtnBkK+8iZ4OyPmC3IMsf32JytPVz1+JOh5WtfqolIZiG\nW3yCkf9iM8f5YxdXJYQ0Sdq2kxGD9EnUn+Kay6KdmaSwfUuVlfdcy9UCgYBPzUtg\nIhfs0ZP5YXLEEp9fK1ELOghR+bPAPysCyv4FG9gQ/VkK/ZGm5ZD4iQIpa5hruCgh\nwBPGJ9ik9Y0QQaSkyTqP7nF9aRzt4tmMOPXyziasYy21CpNHPnZxDX9H7AoXw3tO\nDwlWYTOPGjzL+AXQ5hA5HTSW/4SL6GHtbcYKAQKBgGd/0/xLRb2BFGLE3OrGNRRD\nqFU0qElwrbVs0zP6ZYD5A0LPGCqF285sY9+/Chhr2aiRqY6R5+9oBA8A7VPdUx7Z\npt/vMyoojeZIvwiOGGXuVnXilHRq9IV7ePRjzJYwFPPEKE/PZxx4XNH5wS5Cu9Gb\nshXrdPb1dV2TjCqWqFGq\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-7lsg1@bengkel-fdf57.iam.gserviceaccount.com",
    "client_id": "102837209599717375070",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-7lsg1%40bengkel-fdf57.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};
const firebaseConfig = {
    apiKey: "AIzaSyAL3cJazuD3xUZJSPCa9xeg4AUrIpnO-rU",
    authDomain: "bengkel-fdf57.firebaseapp.com",
    projectId: "bengkel-fdf57",
    storageBucket: "bengkel-fdf57.appspot.com",
    messagingSenderId: "276029858489",
    appId: "1:276029858489:web:50c7bfa6a8fecfa0e37168",
    measurementId: "G-9QDCNRRG1D"
  };
  
pkg.initializeApp({
  credential: pkg.credential.cert(serviceAccountRaw),
  storageBucket: "bengkel-fdf57.appspot.com",

});





const bucket = pkg.storage().bucket();


export { pkg as firebase, bucket , firebaseConfig  };
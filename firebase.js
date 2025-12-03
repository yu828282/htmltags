// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//  firebaseConfig
const firebaseConfig = {
apiKey: "AIzaSyAKVFHiejRODDgFm7Pgh3MwEt51PeO0JZo",
authDomain: "my-coding-clas.firebaseapp.com",
projectId: "my-coding-clas",
storageBucket: "my-coding-clas.firebasestorage.app",
messagingSenderId: "335421283930",
appId: "1:335421283930:web:c05b8bf200977c16c6c263"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM 요소 (로그인 버튼 등)
const loginContainer = document.getElementById('login-container');

// 1. 로그인 상태 감지 및 UI 업데이트
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 로그인 되었을 때
        console.log("Logged in as:", user.displayName);
        if(loginContainer) {
            loginContainer.innerHTML = `
                <span style="margin-right:10px; font-weight:bold;">Welcome👋 ${user.displayName}!</span>
                <button id="logout-btn" class="btn-login">log out</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        }
        
        // 현재 페이지의 진도 불러오기 (연습 페이지인 경우에만)
        if (typeof loadProgressFromDB === 'function') {
            loadProgressFromDB(user.uid);
        }

    } else {
        // 로그아웃 되었을 때
        if(loginContainer) {
            loginContainer.innerHTML = `
                <button id="login-btn" class="btn-login">Login</button>
            `;
            document.getElementById('login-btn').addEventListener('click', handleLogin);
        }
    }
});

// 2. 로그인 함수
function handleLogin() {
    signInWithPopup(auth, provider)
        .then((result) => {
            // 로그인 성공
        }).catch((error) => {
            console.error(error);
            alert("로그인 실패: " + error.message);
        });
}

// 3. 로그아웃 함수
function handleLogout() {
    signOut(auth).then(() => {
        window.location.reload();
    });
}

// 4. 진도 저장 함수 (외부에서 호출 가능하게 export)
export async function saveProgressToDB(pageKey, topicId) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please login first!");
        return;
    }

    const userRef = doc(db, "users", user.uid);

    try {
        // 해당 유저 문서가 없으면 생성하면서 저장, 있으면 업데이트
        // arrayUnion은 배열에 중복 없이 값을 추가해줍니다.
        await setDoc(userRef, {
            [pageKey]: arrayUnion(topicId) 
        }, { merge: true });
        
        console.log("Progress saved!");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// 5. 진도 불러오기 함수 
export async function getUserProgress(pageKey) {
    const user = auth.currentUser;
    if (!user) return [];

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return data[pageKey] || []; // 해당 페이지의 진도 배열 반환 (없으면 빈 배열)
    } else {
        return [];
    }
}
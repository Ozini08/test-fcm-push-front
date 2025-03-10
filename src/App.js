import "./App.css";
import { useEffect, useState } from "react";
import Switch from "react-switch"; // react-switch 추가
import { requestFCMToken } from "./firebaseConfig";

function App() {
  const [fcmToken, setFcmToken] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isNotificationOn, setIsNotificationOn] = useState(false);
  const [memberList, setMemberList] = useState([]);

  // 알림 ON/OFF 토글
  const handleToggleNotification = async (checked) => {
    setIsNotificationOn(checked);

    if (checked) {
      const token = await requestFCMToken();
      setFcmToken(token);
      if (token) {
        try {
          const responseOn = await fetch("/api/fcm/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, memberNo: 19 }),
          });
          if (!responseOn.ok) throw new Error("토큰저장실패");
        } catch (error) {
          console.error("Error saving token:", error);
          alert("저장 중 오류가 발생했습니다.");
          setIsNotificationOn(false); // 실패 시 다시 OFF
        }
      }
    } else {
      try {
        const responseOff = await fetch("/api/fcm/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberNo: 19 }),
        });
        if (!responseOff.ok) throw new Error("삭제실패");
      } catch (error) {
        console.error("Error saving token:", error);
        alert("토큰삭제실패.");
        setIsNotificationOn(true); // 실패 시 다시 ON
      }
    }
  };

  useEffect(() => {
    const fetchMemberList = async () => {
      try {
        const response = await fetch("/api/fcm/list");
        if (!response.ok) throw new Error("데이터 로드 실패");

        const data = await response.json();
        setMemberList(data);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMemberList([]);
      }
    };
    fetchMemberList();
  }, []);

  const requestData = { title, message };

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (title && message) {
      try {
        const response = await fetch("/api/fcm/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
        if (!response.ok) throw new Error("푸시메시지 전송실패");
        alert("푸시 메시지가 전송되었습니다!");
      } catch (error) {
        console.error("Error saving message:", error);
        alert("저장 중 오류가 발생했습니다.");
      }
    } else {
      alert("푸시 메시지와 FCM 토큰이 필요합니다.");
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <h2>FCM 알림 활성 회원 목록</h2>
        {memberList.length > 0 ? (
          <table border="1">
            <thead>
              <tr>
                <th>회원 번호</th>
                <th>회원 이름</th>
                <th>토큰 번호</th>
                <th>알림 상태</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member, index) => (
                <tr key={index}>
                  <td>{member.MEMBER_NO}</td>
                  <td>{member.MEMBER_NAME}</td>
                  <td>{member.TOKEN_NO}</td>
                  <td>{member.ENABLED ? "ON" : "OFF"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>불러올 데이터가 없습니다.</p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
          <span>알림 {isNotificationOn ? "ON" : "OFF"}</span>
          <Switch
            onChange={handleToggleNotification}
            checked={isNotificationOn}
            offColor="#bbb"
            onColor="#0d6efd"
            uncheckedIcon={false}
            checkedIcon={false}
            height={20}
            width={40}
            handleDiameter={18}
          />
        </div>

        <textarea value={fcmToken} readOnly rows="5" cols="50" />

        <p>푸시 알림 제목 입력:</p>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

        <p>푸시 알림 메시지 입력:</p>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="5" cols="50" />

        <button onClick={handleSendMessage}>푸시 알림 전송</button>
      </div>
    </div>
  );
}

export default App;

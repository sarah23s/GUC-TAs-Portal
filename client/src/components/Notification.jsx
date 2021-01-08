import React, { useState, useEffect } from "react";
import axiosCall from "../helpers/axiosCall";
import { useToasts } from "react-toast-notifications";
import checkLogin from "../helpers/checkLogin";
import Avatar from "react-avatar";

function Notification(props) {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const [data, setData] = useState({ data: [] });

  useEffect(() => {
    async function fetchData() {
      const res = await checkLogin();
      console.log(
        "🚀 ~ file: Notification.jsx ~ line 13 ~ fetchData ~ res",
        res.gucId
      );

      const notifications = (
        await axiosCall("get", `notifications/${res.gucId}`)
      ).data.data;

      const results = notifications.map((notification) => {
        const temp = new Date(notification.createdAt);
        const date =
          temp.getFullYear() +
          "-" +
          (temp.getMonth() + 1 > 9
            ? temp.getMonth() + 1
            : "0" + (temp.getMonth() + 1)) +
          "-" +
          (temp.getDate() > 9 ? temp.getDate() : "0" + temp.getDate()) +
          " " +
          temp.getHours() +
          ":" +
          (temp.getMinutes() > 9 ? temp.getMinutes() : "0" + temp.getMinutes());

        return {
          message: notification.message,
          date: date,
          isSeen: notification.is_Seen,
        };
      });

      setData(results);
    }
    fetchData();
  }, []);

  return (
    <div className="notification-container">
      <h3>Notifications:</h3>
      <hr />
      <div className="all-notifications">
        {data.length > 0 &&
          data.map((notification) => (
            <div className="notification-inner-container">
              <Avatar
                maxInitials={1}
                size={35}
                round={true}
                name={characters.charAt(
                  Math.floor(Math.random() * characters.length)
                )}
              />
              <div className="notification-content">
                <h6>{notification.date}</h6>
                <h5>{notification.message}</h5>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Notification;

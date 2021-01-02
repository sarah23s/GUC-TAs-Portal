import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import checkLogin from "../helpers/checkLogin";
import axiosCall from "../helpers/axiosCall";
import { useToasts } from "react-toast-notifications";

import id from "../assets/id2.svg";
import signIn from "../assets/signin.svg";
import signOut from "../assets/signout.svg";

//TODO: integrate button of attendance records
//TODO: responsiveness
//TODO: design
//TODO: department

function Homepage() {
  const [user, setUser] = useState("");
  const [location, setLocation] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const { addToast } = useToasts();

  useEffect(() => {
    async function fetchData() {
      //get user
      const user = await checkLogin();
      setUser(user);

      //get location
      const locationRes = await axiosCall("get", "locations/room/all");
      let office;
      if (locationRes.data.data) {
        office = locationRes.data.data.find(
          ({ _id }) => _id === user.officeLocation
        );

        setLocation(office.location);
      }

      if (user.type === "Academic Member") {
        //get faculty
        const facultyRes = await axiosCall("get", "faculties/faculty/all");
        let fac;
        if (facultyRes.data.data) {
          fac = facultyRes.data.data.find(({ _id }) => _id === user.faculty);
          setFaculty(fac.code);
        }

        //get department
        const depRes = await axiosCall("get", "departments/all/all");
        let dep;
        if (depRes.data.data) {
          //TODO:fix backend
          dep = depRes.data.data.find(({ _id }) => _id === user.department);
          setDepartment(dep.name);
        }
      }

      //get days
      const daysRes = await axiosCall("get", "attendance/viewMissingDays");
      if (daysRes.data) setDays(daysRes.data);

      //get days
      const hoursRes = await axiosCall("get", "attendance/viewHours");
      if (hoursRes.data) setHours(hoursRes.data);
    }
    fetchData();
  }, []);

  const handleSignIn = async () => {
    try {
      const res = await axiosCall("post", "staffMembers/signIn");

      if (res.data.data) {
        addToast("Signed in successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      }

      if (res.data.error) {
        addToast(res.data.error, {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast(error, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await axiosCall("post", "staffMembers/signOut");

      if (res.data.data) {
        addToast("Signed out successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      }

      if (res.data.error) {
        addToast(res.data.error, {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast(error, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <div id="homepage">
      <div className="left-hp">
        <div className="inner-homepage-box">
          <ul>
            <li>
              <h5>Guc-Id: </h5>
              <h6>{user.gucId} </h6>
            </li>
            <li>
              <h5>Name: </h5>
              <h6> {user.name}</h6>
            </li>
            <li>
              <h5>Gender: </h5>
              <h6> {user.gender}</h6>
            </li>
            <li>
              <h5>Email: </h5>
              <h6> {user.email}</h6>
            </li>
            <li>
              <h5>Office Location: </h5>
              <h6> {location}</h6>
            </li>
            <li>
              <h5>Position: </h5>
              <h6> {user.type}</h6>
            </li>
            {user.type === "Academic Member" ? (
              <li>
                <h5>Faculty: </h5>
                <h6> {faculty}</h6>
              </li>
            ) : null}
            {user.type === "Academic Member" ? (
              <li>
                <h5>Department: </h5>
                <h6> {department}</h6>
              </li>
            ) : null}
            <br></br>
            <li>
              <h5>Missing Days: </h5>
              <h6> {days}</h6>
            </li>
            <li>
              <h5>Missing/Extra hours: </h5>
              <h6> {hours}</h6>
            </li>
          </ul>
          <button className="attendanceRecord-btn">
            View Attendance Record
          </button>
        </div>
      </div>
      <div className="right-hp">
        <img alt="" src={id} className="profile-icon" />
        <Button
          variant="success"
          className="sign-btn green"
          onClick={handleSignIn}
        >
          <img alt="" src={signIn} className="sign-btn-icon" />
          <h6> Sign in</h6>
        </Button>
        <Button
          variant="danger"
          className="sign-btn red"
          onClick={handleSignOut}
        >
          <img alt="" src={signOut} className="sign-btn-icon" />
          <h6> Sign Out</h6>
        </Button>
      </div>
    </div>
  );
}

export default Homepage;
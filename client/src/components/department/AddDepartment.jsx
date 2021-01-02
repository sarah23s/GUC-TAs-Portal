import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import axiosCall from "../../helpers/axiosCall";
import { useToasts } from "react-toast-notifications";
import axios from "axios";

import {
  FormControl,
  InputLabel,
  Select,
  Input,
  FormHelperText,
  MenuItem,
} from "@material-ui/core";

function AddFaculty() {
  const [faculties, setFaculties] = useState({ faculties: [] });
  const [facultyChosen, setFacultyChosen] = useState("");
  const [staff, setStaff] = useState({ staff: [] });
  const [HODChosen, setHODChosen] = useState("");
  const [name, setName] = useState("");

  const { addToast } = useToasts();

  useEffect(() => {
    async function fetchData() {
      const facResult = await axiosCall("get", "faculties/faculty/all");
      const staffResult = await axiosCall(
        "get",
        "staffMembers/AC/Course Instructor/all"
      );
      setFaculties(facResult.data.data);
      setStaff(staffResult.data.data);
    }
    fetchData();
  }, [facultyChosen]);

  const handleSubmit = async () => {
    try {
      let code;
      if (faculties)
        code = await faculties.find(({ _id }) => _id === facultyChosen).code;

      let HOD;
      if (HODChosen)
        HOD = await staff.find(({ _id }) => _id === HODChosen).gucId;

      const body = {
        facultyCode: code.toUpperCase(),
        depName: name,
        HOD: HODChosen ? HOD : undefined,
      };

      const res = await axiosCall("post", "departments/department", body);

      if (res.data.data) {
        addToast("Department created successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        setFacultyChosen("");
        setHODChosen("");
        setName("");
      }

      if (res.data.error) {
        addToast(res.data.error, {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (err) {
      console.log("~err: ", err);
    }
  };

  return (
    <div className="crud-inner-container">
      <div className="crud-form">
        <FormControl className="crud-formControl" required>
          <InputLabel className="crud-inputLabel">Faculty</InputLabel>
          <Select
            className="crud-select"
            value={facultyChosen}
            onChange={(event) => {
              setFacultyChosen(event.target.value);
            }}
          >
            {faculties.length > 0 &&
              faculties.map((faculty) => (
                <MenuItem
                  className="crud-menuItem"
                  value={faculty._id}
                  key={faculty._id}
                >
                  {faculty.code} - {faculty.name}
                </MenuItem>
              ))}
          </Select>
          <FormHelperText className="crud-helperText">
            This field is required
          </FormHelperText>
        </FormControl>

        <FormControl className="crud-formControl" required>
          <InputLabel className="crud-inputLabel">Department Name</InputLabel>
          <Input
            className="crud-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <FormHelperText className="crud-helperText">
            This field is required
          </FormHelperText>
        </FormControl>

        <FormControl className="crud-formControl">
          <InputLabel className="crud-inputLabel">
            Head of Department
          </InputLabel>
          <Select
            className="crud-select"
            value={HODChosen}
            onChange={(event) => {
              setHODChosen(event.target.value);
            }}
          >
            {staff.length > 0 &&
              staff.map((member) => (
                <MenuItem
                  className="crud-menuItem"
                  value={member._id}
                  key={member._id}
                >
                  {member.gucId} {member.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </div>

      <Button
        variant="success"
        className="crud-submit crud-add-btn green"
        disabled={facultyChosen === "" || name === "" ? true : false}
        onClick={handleSubmit}
      >
        Add Department
      </Button>
    </div>
  );
}

export default AddFaculty;
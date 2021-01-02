import React, { useState, useEffect } from "react";
import MaterialTable from "material-table";
import Avatar from "react-avatar";
import Grid from "@material-ui/core/Grid";
import { useToasts } from "react-toast-notifications";
import axiosCall from "../../helpers/axiosCall";
import { link } from "../../helpers/constants.js";
import { Button } from "@material-ui/core";

function ViewAllStaff() {
  const [data, setData] = useState([]); //table data
  const { addToast } = useToasts();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      document.location.href = "/login";
    } else {
      async function fetchData() {
        try {
          const response = await axiosCall(
            "get",
            `${link}/departments/getAllStaffMembers`
          );
          const locations = await axiosCall(
            "get",
            `${link}/locations/room/all`
          );
          console.log(locations.data.data);

          if (response.data.data.error) {
            addToast(response.data.data.error, {
              appearance: "warning",
              autoDismiss: true,
            });
          } else {
            let data = response.data.data.map((staff) => {
              return {
                name: staff.name,
                gucId: staff.gucId,
                gender: staff.gender,
                email: staff.email,
                role: staff.role,
                salary: staff.salary,
                id: staff._id,
                location: locations.data.data
                  .map((location) => {
                    if (staff.officeLocation === location._id) {
                      return location.location;
                    } else return null;
                  })
                  .filter((location) => location !== null),
              };
            });
            setData(data);
          }
        } catch (err) {
          console.log("~ err", err);
          document.location.href = "/unauthorized";
        }
      }
      fetchData();
    }
  }, []);
  
  return (
    // styling
    <div>
      <Grid container spacing={3}>
        <Grid item xs={2}></Grid>
        <Grid item xs={9}>
          <br />
          <br />
          <MaterialTable
            title=""
            columns={[
              {
                title: "Avatar",
                render: (rowData) => (
                  <Avatar
                    maxInitials={1}
                    size={40}
                    round={true}
                    name={rowData === undefined ? " " : rowData.name}
                  />
                ),
              },
              { title: "Name", field: "name" },
              { title: "Gender", field: "gender" },
              { title: "ID", field: "gucId" },
              { title: "Role", field: "role" },
              { title: "Email", field: "email" },
              { title: "office", field: "location" },
            ]}
            data={data}
            actions={[
              {
                icon: "save",
                tooltip: "Save User",
                onClick: (event, rowData) => {
                  document.location.href = `${rowData.id}/viewSchedule`;
                },
              },
            ]}
            options={{
              actionsColumnIndex: -1,
            }}
            components={{
              Action: (props) => (
                <Button
                  onClick={(event) => props.action.onClick(event, props.data)}
                  color="primary"
                  variant="contained"
                  style={{ textTransform: "none" }}
                  size="small"
                >
                  View schedule
                </Button>
              ),
            }}
            //onRowClick={(event, rowData, togglePanel) => togglePanel()}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default ViewAllStaff;

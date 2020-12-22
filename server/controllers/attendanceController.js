const ObjectId = require('mongoose').Types.ObjectId;
// required models
const staffMember = require('../models/StaffMember');


//Function 8: View all their attendance records, or they can specify exactly which month to view.
exports.viewAttendance = async function (req, res) {
    try {
        const id = req.user.gucId;
        const { month1, month2, all } = req.body;

        if (((!month1 || !month2) && !all)) {
            res.send({ error: "You should choose an option" });
            return;
        }
        //Type Vaildation
        if(typeof(month1) !== 'number' || typeof(month2) !== 'number'){
            res.send({error: "You should enter a number in the month"});
            return;
        }else if(month1<1 || month1>12 || month2<1 || month2>12){
            res.send({error: "You should enter a whole number in the month"});
            return;
        }
        if(typeof(all) !== 'string'){
            res.send({error: "You should enter a string in all"});
            return;
        }

        if (all === 'all') {
            const staff = await staffMember.findOne({ gucId: id });
            if (!staff) {
                res.send("There is no staff with this ID: " + id);
                return;
            }
            attendanceRecord = staff.attendanceRecords;
            if (!attendanceRecord) {
                res.send({ error: "There is no attendance records yet for this ID: " + id });
                return;
            }
            res.send({ data: attendanceRecord });
        } else {
            attendanceRecord = await viewAttendance(id, month1, month2);
            if (typeof (attendanceRecord) === 'string')
                res.send(attendanceRecord);
            else
                res.json(attendanceRecord);
        }
    } catch (err) {
        console.log('~ err', err);
        res.status(500).send({ err: `Internal Server Error: ${err}` });
    }
}

//Function 9: View if they have missing days.
exports.viewMissingDays = async function (req, res) {
    try {
        const id = req.user.gucId;
        mDays = await module.exports.findMissingDays(id);
        if (typeof (mDays) === 'string') {
            res.send(mDays);
        } else
            res.send("Number of missing days: " + mDays);
    } catch (err) {
        console.log('~ err', err);
        res.status(500).send({ error: `Internal Server Error: ${err}` });
    }
}

//Function 10: View if they are having missing hours or extra hours.
exports.viewMissingHours = async function (req, res) {
    try {
        const id = req.user.gucId;
        const minutesSpent = await module.exports.findMissingMinutes(id);
        if (typeof (minutesSpent) === 'string') {
            res.send(minutesSpent);
            return;
        }
        const hoursSpentPrinted = Math.floor(Math.abs(minutesSpent) / 60);
        const minutesSpentPrinted = Math.abs(minutesSpent) % 60;
        const sign = minutesSpent < 0 ? "-" : "";
        const sentRes = "Missing/extra hours: " + sign + hoursSpentPrinted + " hrs." + minutesSpentPrinted + " min.";
        res.send(sentRes);
    } catch (err) {
        console.log('~ err', err);
        return res.status(500).send({ err: `Internal Server Error: ${err}` });
    }
}

//Function 17: Manually add a missing signin/sign out record of a staff member except for himself/herself.
exports.addMissingSignInOut = async function (req, res) {
    try {
        const { id, signIn, signOut, date, day, number } = req.body;

        if ((!signIn && !signOut) || !date || (!day && day!==0) || !id || !number) {
            res.send({ error: "The sign in/out, date, and day should be specified" });
            return;
        }

        if (id === req.user.gucId) {
            res.send("You are not able to add a missing signIn/Out for yourself");
            return;
        }

        //Validation
        if(typeof(id)!=='string'){ //
            res.send("You should write the ID as a string");
            return;
        }

        // signInTimeFormat = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.signIn;
        // signOutTimeFormat = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.signOut;
        // console.log(signOutTimeFormat);
        // console.log(signOutTimeFormat);
        // if(!signInTimeFormat || !signOutTimeFormat){
        //     res.send("You should write the signIn/Out time in the correct time format hh:mm:ss");
        //     return;
        // }

        // dateFormat = /^([0-9][0-9][0-9][0-9])-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2]?[0-9]|3[0-1])?$/.date;
        // if(!dateFormat){
        //     res.send("You should write the signIn/Out date in the correct date format yyyy-mm-dd");
        //     return;
        // }

        console.log(typeof(day)=== 'number');
        if(typeof(day) !== 'number' || (typeof(day) === 'number' && (day>6 || day<0))){
            res.send("You should write the day of sign in/out as a whole number from 0-6 where 0 is Sunday and 6 is Saturday");
            return;
        }

        const staff = await staffMember.findOne({ gucId: id });
        if (!staff) {
            res.send("There is no staff with this ID: " + id);
            return;
        }
        today = new Date();
        year = parseInt(date.substring(0, 4));
        month = parseInt(date.substring(5, 7));
        todayDay = parseInt(date.substring(8, 10));
        //Check if the date inserted is in the future
        if (year > today.getFullYear() || (year === today.getFullYear() && month > (today.getMonth() + 1)) ||
            (year === today.getFullYear() && month === (today.getMonth() + 1) && todayDay > today.getDate())) {
            res.send({ error: `You cannot add a signIn/Out on a future date ${date}` });
            return;
        }
        attendanceRecord = staff.attendanceRecords;
        indexesOfDateRecords = []; // list of the indexes of the attendance records having the same date inside the attendance record
        for (i = 0; i < attendanceRecord.length; i++) {
            if (attendanceRecord[i].date === date && attendanceRecord[i].day === day) {
                indexesOfDateRecords.push(i);
            }
        }
        //If the HR adds a missing signIn and a missing signOut (In this case, the number to add them will be neglected)
        if (signIn && signOut) {
            //Check if the start time greater than the end time
            signInhrs = parseInt(signIn.substring(0, 2));
            signInMin = parseInt(signIn.substring(3, 5));
            signInSec = parseInt(signIn.substring(6, 8));
            signOuthrs = parseInt(signOut.substring(0, 2));
            signOutMin = parseInt(signOut.substring(3, 5));
            signOutSec = parseInt(signOut.substring(6, 8));
            if (signInhrs > signOuthrs || (signInhrs === signOuthrs && signInMin > signOutMin) ||
                ((signInhrs === signOuthrs && signInMin === signOutMin && signInSec > signOutSec))) {
                res.send({ error: `You cannot add a signIn time: ${signIn} that is after the signOut time: ${signOut}` });
                return;
            }
            if (indexesOfDateRecords.length === 1 && !attendanceRecord[indexesOfDateRecords[0]].startTime && !attendanceRecord[indexesOfDateRecords[0]].endTime) {
                //If it is the first time to sign in the given date, it will update the default record
                attendanceRecord[indexesOfDateRecords[0]].startTime = signIn;
                attendanceRecord[indexesOfDateRecords[0]].endTime = signOut;
                attendanceRecord[indexesOfDateRecords[0]].status = 'Present'
            } else {
                //If it is not the case, a new attendance record will be added
                attendanceRecord.push({
                    day: day,
                    date: date,
                    startTime: signIn,
                    endTime: signOut,
                    status: 'Present',
                    absentsatisfied: false,
                    absentStatus: null
                })
            }
        } else if (!signIn) {
            //If the HR adds a missing signOut
            if (number > indexesOfDateRecords.length) {
                //If the number specified to edit a record is greater than the number of records we have of that day
                //Then, we add a new record (If the staff member signed in and out for multiple times, and he/she signed in afterwards)
                attendanceRecord.push({
                    day: day,
                    date: date,
                    endTime: signOut,
                    status: 'Present',
                    absentsatisfied: false,
                    absentStatus: null
                })
            } else {
                //Check if the start time greater than the end time
                sTime = attendanceRecord[indexesOfDateRecords[number - 1]].startTime;
                signInhrs = parseInt(sTime.substring(0, 2));
                signInMin = parseInt(sTime.substring(3, 5));
                signInSec = parseInt(sTime.substring(6, 8));
                signOuthrs = parseInt(signOut.substring(0, 2));
                signOutMin = parseInt(signOut.substring(3, 5));
                signOutSec = parseInt(signOut.substring(6, 8));
                if (signInhrs > signOuthrs || (signInhrs === signOuthrs && signInMin > signOutMin) ||
                    ((signInhrs === signOuthrs && signInMin === signOutMin && signInSec > signOutSec))) {
                    res.send({ error: `You cannot add a signOut time: ${signOut} that is before the signIn time: ${sTime}` });
                    return;
                }
                attendanceRecord[indexesOfDateRecords[number - 1]] = {
                    day: day,
                    date: date,
                    startTime: sTime,
                    endTime: signOut,
                    status: 'Present',
                    absentsatisfied: false,
                    absentStatus: null
                }
            }
        } else if (!signOut) {
            //If the HR adds a missing signIn
            if (number > indexesOfDateRecords.length) {
                //If the number specified to edit a record is greater than the number of records we have of that day
                //Then, we add a new record (If the staff member signed in and out for multiple times, and he/she signed in afterwards)
                attendanceRecord.push({
                    day: day,
                    date: date,
                    startTime: signIn,
                    endTime: "",
                    status: 'Present',
                    absentsatisfied: false,
                    absentStatus: null
                })
            } else {
                //Check if the start time greater than the end time
                eTime = attendanceRecord[indexesOfDateRecords[number - 1]].endTime;
                signInhrs = parseInt(signIn.substring(0, 2));
                signInMin = parseInt(signIn.substring(3, 5));
                signInSec = parseInt(signIn.substring(6, 8));
                signOuthrs = parseInt(eTime.substring(0, 2));
                signOutMin = parseInt(eTime.substring(3, 5));
                signOutSec = parseInt(eTime.substring(6, 8));
                if (signInhrs > signOuthrs || (signInhrs === signOuthrs && signInMin > signOutMin) ||
                    ((signInhrs === signOuthrs && signInMin === signOutMin && signInSec > signOutSec))) {
                    res.send({ error: `You cannot add a signIn time: ${signIn} that is after the signOut time: ${eTime}` });
                    return;
                }
                attendanceRecord[indexesOfDateRecords[number - 1]] = {
                    day: day,
                    date: date,
                    startTime: signIn,
                    endTime: eTime,
                    status: 'Present',
                    absentsatisfied: false,
                    absentStatus: null
                }
            }
        }
        updatedStaff = await staffMember.findOneAndUpdate({ gucId: id }, { attendanceRecords: attendanceRecord });
        if (!updatedStaff) {
            res.send({ error: `There is no staff member with the ID ${id}` });
            return;
        }
        attendanceRecordUpdated = await updatedStaff.save();
        res.send({ data: "The missing sign in/out is added successfully" });
    } catch (err) {
        console.log('~ err', err);
        res.status(500).send({ err: `Internal Server Error: ${err}` });
    }
}

//Function 18: View any staff member attendance record.
exports.viewAttendanceHR = async function (req, res) {
    try {
        const { id, month1, month2, all } = req.body;
        if (((!month1 || !month2) && !all) || !id) {
            res.send({ error: "You should choose an option and add the id" });
            return;
        }

        //Type Vaildation
        if(typeof(id)!=='string'){ //
            res.send("You should write the ID as a string");
            return;
        }

        if(typeof(month1) !== 'number' || typeof(month2) !== 'number'){
            res.send({error: "You should enter a number in the month"});
            return;
        }else if(month1<1 || month1>12 || month2<1 || month2>12){
            res.send({error: "You should enter a whole number in the month"});
            return;
        }

        if(typeof(all) !== 'string'){
            res.send({error: "You should enter a string"});
            return;
        }

        if (all === 'all') {
            const staff = await staffMember.findOne({ gucId: id });
            if (!staff) {
                res.send("There is no staff with this ID: " + id);
                return;
            }
            attendanceRecord = staff.attendanceRecords;
            if (!attendanceRecord) {
                res.send({ error: "There is no attendance records yet for this ID: " + id });
                return;
            }
            return res.send({ data: attendanceRecord });
        } else {
            attendanceRecord = await viewAttendance(id, month1, month2);
            if (typeof (attendanceRecord) === 'string')
                return res.send(attendanceRecord);
            else
                return res.json(attendanceRecord);
        }
    } catch (err) {
        console.log('~ err', err);
        res.status(500).send({ error: `Internal Server Error: ${err}` });
    }
}

//Function 19: View staff members with missing hours/days.
exports.viewStaffWithMissingHoursDays = async function (req, res) {
    try {
        attendanceRecords = await staffMember.find();
        if (!attendanceRecords) {
            res.send({ error: "There no staff in the system yet" });
            return;
        }
        staffIDs = [];
        for (i = 0; i < attendanceRecords.length; i++) {
            missingDays = await module.exports.findMissingDays(attendanceRecords[i].gucId);
            missingHours = await module.exports.findMissingMinutes(attendanceRecords[i].gucId);
            if (typeof (missingDays) !== 'string' && typeof (missingHours) !== 'string') {
                if (missingDays > 0 || missingHours < 0) {
                    staffIDs.push(attendanceRecords[i].gucId);
                }
            }
        }
        return res.json({ data: staffIDs });
    } catch (err) {
        console.log('~ err', err);
        return res.status(500).send({ err: `Internal Server Error: ${err}` });
    }
}


/**
 * To get the attendance of a specific work month of a staff member 
 * (from 11 of the first month till 10 of the second month)
 * @param {String} id : guc id
 * @param {number} month1 : the month of the days (11:last day of the month)
 * @param {number} month2 : the following month of 'month1' with the days (1:10)
 * returns the attendance record
 */
async function viewAttendance(id, month1, month2) {
    const staff = await staffMember.findOne({ gucId: id });
    if (!staff) {
        return "There is no staff with this ID: " + id;
    }

    if(typeof(id)!=='string'){ 
        res.send("You should write the ID as a string");
        return;
    }

    attendanceRecord = staff.attendanceRecords;
    if (!attendanceRecord) {
        return "There is no attendance records yet for this ID: " + id;
    }
    if ((month1 !== 12 && month2 - month1 !== 1) || (month1 === 12 && month2 !== 1)) {
        return "The months should be consecutive";
    }
    currDate = new Date();
    //To get the attendance record of this month on the current year only
    currYear = currDate.getFullYear();
    currMonth = currDate.getMonth() + 1;
    //If the current month is 12 and the first part of the month is also 12,
    //we need to get the records of the current year of the first part and next year for the second part
    //Otherwise, if the first part of the month is 12, we get the records of the previous year 
    if (month1 === 12 && currMonth !== 12) {
        previousYear = currYear - 1;
    } else {
        previousYear = currYear;
        if (month1 === 12 && currMonth === 12) {
            currYear++;
        }
    }
    //date has the format yyyy-mm-dd in a string
    //If the month specified is Dec-Jan, the year of Dec. will be the previous year
    filteredRecords = attendanceRecord.filter((record) =>
        (parseInt(record.date.substring(8, 10)) >= 11 && parseInt(record.date.substring(5, 7)) === month1 && parseInt(record.date.substring(0, 4)) === previousYear) ||
        (parseInt(record.date.substring(8, 10)) < 11 && parseInt(record.date.substring(5, 7)) === month2 && parseInt(record.date.substring(0, 4)) === currYear));
    return filteredRecords;
}

/**
 * To get the number of the missing days in the current month of a staff member
 * @param {String} id : guc id
 * returns the number of the missing days
 */
exports.findMissingDays = async function (id) {
    const staff = await staffMember.findOne({ gucId: id });
    if (!staff) {
        return "There is no staff with this ID: " + id;
    }
    attendanceRecord = staff.attendanceRecords;
    if (!attendanceRecord) {
        return "There is no attendance records yet for this ID: " + id;

    }
    const dayOff = staff.dayOff;
    currDate = new Date();
    todayDate = currDate.getDate();
    //monthFirstDays: the month of the days (1:10)
    //monthLastDays : the month of the days (11:last day of the month)
    //previousYear  : the year of the variable 'monthFirstDays'
    //nextYear      : the year of the variable 'monthLastDays'
    if (todayDate < 11) {
        //the month of the first days will be the current month
        monthFirstDays = currDate.getMonth() + 1; //getMonth() gives the current month - 1
        //the year of the first days will be the current year
        nextYear = currDate.getFullYear();
        //If the month of the days(1:10) is Jan., the month of the days (11:31) will be Dec. Otherwise, it will be normally the last month.
        monthLastDays = monthFirstDays == 1 ? 12 : monthFirstDays - 1;
        //If the month of the days(1:10) is Jan., the year of the days (11:31) will be last year. Otherwise, it will normally remain the current year.
        previousYear = monthFirstDays == 1 ? nextYear - 1 : nextYear;
    } else {
        //the month of the last days will be the current month
        monthLastDays = currDate.getMonth() + 1;
        //the year of the last days will be the current year
        previousYear = currDate.getFullYear();
    }
    dayOffNum = "0";
    switch (dayOff) {
        case "Monday": dayOffNum = "1"; break;
        case "Tuesday": dayOffNum = "2"; break;
        case "Wednesday": dayOffNum = "3"; break;
        case "Thursday": dayOffNum = "4"; break;
        case "Friday": dayOffNum = "5"; break;
        case "Saturday": dayOffNum = "6"; break;
        default: dayOffNum = "0"; break;
    }
    //Filtering the days from 11 of the current month to 10 of the upcoming month and the status of that day is absent
    monthRecords = attendanceRecord.filter((record) =>
        (todayDate < 11 && (parseInt(record.date.substring(5, 7)) === monthFirstDays && parseInt(record.date.substring(8, 10)) < 11 && parseInt(record.date.substring(0, 4)) === nextYear))
        || (parseInt(record.date.substring(5, 7)) === monthLastDays && parseInt(record.date.substring(8, 10)) >= 11 && parseInt(record.date.substring(0, 4)) === previousYear)
        && record.day !== "5" && record.day !== dayOffNum);
    missingDays = 0;
    initialDay = 11;
    initialMonth = monthLastDays;
    initialYear = previousYear;
    initDate = new Date();
    initDate.setFullYear(initialYear);
    initDate.setMonth(initialMonth - 1);
    initDate.setDate(initialDay);
    initialWeekDay = initDate.getDay();
    while ((initialDay <= todayDate && todayDate >= 11 && initDate >= 11) || (todayDate < 11 && ((initialDay <= todayDate && initDate < 11) ||
        (initDate >= 11 && initialMonth == monthLastDays && initialYear === previousYear)))) {
        dayRecords = monthRecords.some((record) => {
            return parseInt(record.date.substring(5, 7)) === initialMonth && parseInt(record.date.substring(0, 4)) === initialYear
                && parseInt(record.date.substring(8, 10)) === initialDay && record.startTime && record.endTime
        });
        if (!dayRecords  && initialWeekDay !== 5 && initialWeekDay !== parseInt(dayOffNum)) missingDays++;

        if (((initialMonth === 1 || initialMonth === 3 || initialMonth === 5 || initialMonth === 7 || initialMonth === 8 || initialMonth === 10 || initialMonth === 12) && initialDay === 31)
            || ((initialMonth === 4 || initialMonth === 6 || initialMonth === 9 || initialMonth === 11) && initialDay === 30) ||
            (initialMonth === 2 && ((initialDay === 28 && initialYear % 4 !== 0) || (initialDay === 29 && initialYear % 4 === 0)))) {
            initialDay = 1;
            initialMonth = monthFirstDays;
            initialYear = nextYear;
        } else {
            initialDay++;
        }
        initialWeekDay = (initialWeekDay === 6) ? 0 : initialWeekDay + 1;
    }

    return missingDays;
}

/**
 * To get the number of the missing/extra hours in the current month of a staff member
 * @param {String} id : guc id
 * returns the missing/extra minutes spent 
 */
exports.findMissingMinutes = async function (id) {
    const staff = await staffMember.findOne({ gucId: id });
    if (!staff) {
        return "There is no staff with this ID: " + id;
    }
    attendanceRecord = staff.attendanceRecords;
    if (!attendanceRecord) {
        return "There is no attendance records yet for this ID: " + id;

    }
    const dayOff = staff.dayOff;
    currDate = new Date();
    todayDate = currDate.getDate();
    if (todayDate < 11) {
        monthFirstDays = currDate.getMonth() + 1;
        nextYear = currDate.getFullYear();
        monthLastDays = monthFirstDays == 1 ? 12 : monthFirstDays - 1;
        previousYear = monthFirstDays == 1 ? nextYear - 1 : nextYear;
    } else {
        monthLastDays = currDate.getMonth() + 1;
        previousYear = currDate.getFullYear();
    }

    dayOffNum = "0";
    switch (dayOff) {
        case "Monday": dayOffNum = "1"; break;
        case "Tuesday": dayOffNum = "2"; break;
        case "Wednesday": dayOffNum = "3"; break;
        case "Thursday": dayOffNum = "4"; break;
        case "Friday": dayOffNum = "5"; break;
        case "Saturday": dayOffNum = "6"; break;
        default: dayOffNum = "0"; break;
    }

    filteredRecords = attendanceRecord.filter((record) =>
        (todayDate < 11 && (parseInt(record.date.substring(5, 7)) === monthFirstDays && parseInt(record.date.substring(8, 10)) < 11 && parseInt(record.date.substring(0, 4)) === nextYear))
        || (parseInt(record.date.substring(5, 7)) === monthLastDays && parseInt(record.date.substring(8, 10)) >= 11 && parseInt(record.date.substring(0, 4)) === previousYear)
        && record.status === "Present" && record.startTime && record.endTime && record.day !== dayOffNum && record.day !== "5");

    cumulativeHours = 0.0;
    cumulativeMin = 0.0;
    datesExist = [] //To keep track of the dates in the attendance record (in case of there are duplicates 'multiple sign in/outs')
    filteredRecords.forEach((record) => {
            startTimeHrs = parseInt(record.startTime.substring(0, 2)); //The hours of the sign in time
            endTimeHrs = parseInt(record.endTime.substring(0, 2));     //The hours of the sign out time
            startTimeMin = parseInt(record.startTime.substring(3, 5)); //The mins of the signed in time
            endTimeMin = parseInt(record.endTime.substring(3, 5));     //The mins of the sign out time
            //The calculated spent hours is from 07:00 till 19:00
            if (startTimeHrs < 7) { //If the signedIn hour is before 7, we set it to 7 to ignore the eariler hours
                startTimeHrs = 7;
                startTimeMin = 0;
            }
            if (endTimeHrs > 19 || (endTimeHrs === 19 && endTimeMin > 0)) { //If the signedOut hour is after 19, we set it to 19 to ignore the later hours
                endTimeHrs = 19;
                endTimeMin = 0;
            }
            //If the signedIn was after 19 or the signedOut was before 7, there is no hours spent is calculated (set to 0)
            //If the signed in time is after the signed out time, it will be neglected
            if (startTimeHrs >= 19 || endTimeHrs < 7 || startTimeHrs > endTimeHrs || (startTimeHrs === endTimeHrs && startTimeMin > endTimeMin)) {
                minSpent = 0;
                hrsSpent = 0;
            } else {
                minSpent = parseInt(endTimeMin) - parseInt(startTimeMin);
                hrsSpent = parseInt(endTimeHrs) - parseInt(startTimeHrs);
            }
            if (minSpent < 0) {
                hrsSpent--;
                minSpent = 60 - Math.abs(minSpent);
            }
            cumulativeHours += hrsSpent;
            cumulativeMin += minSpent;

            //To count the days that he should come (to be able to calculate the total minimum spent minutes) without the days off
                if (datesExist.length === 0) {
                    datesExist.push(record.date);
                }
                else {
                    dateFound = datesExist.some((date)=>{
                        return date === record.date;
                    })
                    if (!dateFound) datesExist.push(record.date);
                }
    })
    return (cumulativeHours * 60 + cumulativeMin) - 504 * datesExist.length;
}
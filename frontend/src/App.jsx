import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import AdminDashboard from "./pages/AdminDashboard";
import GuruDashboard from "./pages/GuruDashboard";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoute from "./utils/RoleBaseRoute";
import AdminSummary from "./components/dashboard/AdminSummary";
import ForgotPass from "./components/forgotPass/ForgotPass";
import ResetPass from "./components/resetPass/ResetPass";
import SubjectList from "./components/subject/SubjectList";
import AddSubject from "./components/subject/AddSubject";
import RoomList from "./components/class/RoomList";
import AddRoom from "./components/class/AddRoom";
import EditSubject from "./components/subject/EditSubject";
import EditRoom from "./components/class/EditRoom";
import ScheduleList from "./components/schedule/ScheduleList";
import AddSchedule from "./components/schedule/AddSchedule";
import EditSchedule from "./components/schedule/EditSchedule";
import StudentByRoom from "./components/student/StudentByRoom";
import GuruList from "./components/guru/GuruList";
import AddGuru from "./components/guru/AddGuru";
import View from "./components/guru/View";
import Edit from "./components/guru/Edit";
import UbahPass from "./components/setting/UbahPass";
import Profile from "./components/profile/Profile";
import EditProfile from "./components/profile/EditProfile";
import Presensi from "./components/presensi/Presensi";
import InitGalleryButton from "./components/initGalery/InitGalleryButton";
import StudentList from "./components/student/StudentList";
import CameraButton from "./components/presensi/CameraButton";
import GuruSchedule from "./components/presensi/GuruSchedule";
import FaceRecognition from "./components/presensi/FaceRecognition";
import ConfirmPresensi from "./components/presensi/ConfirmPresensi";
import EditPresensi from "./components/presensi/EditPresensi";
import UserDashboard from "./components/UserDashboard/UserDashboard";
import UbahPresensi from "./components/presensi/UbahPresensi";
import Report from "./components/report/Report";
import ReportDetail from "./components/report/ReportDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/forgotPass" element={<ForgotPass />}></Route>
        <Route path="/resetPass" element={<ResetPass />}></Route>
        {/* ADMIN */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoute requiredRole={["admin"]}>
                <AdminDashboard />
              </RoleBaseRoute>
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminSummary />}></Route>
          {/* Admin */}

          {/* SUBJECT */}
          <Route
            path={"/admin-dashboard/subjects"}
            element={<SubjectList />}
          ></Route>
          <Route
            path={"/admin-dashboard/add-subject"}
            element={<AddSubject />}
          ></Route>
          <Route
            path={"/admin-dashboard/subject/:id"}
            element={<EditSubject />}
          ></Route>

          {/* CLASS */}
          <Route path={"/admin-dashboard/rooms"} element={<RoomList />}></Route>
          <Route
            path={"/admin-dashboard/add-room"}
            element={<AddRoom />}
          ></Route>
          <Route
            path={"/admin-dashboard/room/:id"}
            element={<EditRoom />}
          ></Route>
          <Route
            path={"/admin-dashboard/room/students/:id"}
            element={<StudentByRoom />}
          ></Route>

          {/* SCHEDULE */}
          <Route
            path={"/admin-dashboard/schedules"}
            element={<ScheduleList />}
          ></Route>
          <Route
            path={"/admin-dashboard/add-schedule"}
            element={<AddSchedule />}
          ></Route>
          <Route
            path={"/admin-dashboard/schedule/:id"}
            element={<EditSchedule />}
          ></Route>

          {/* GURU */}
          <Route
            path={"/admin-dashboard/guru-guru"}
            element={<GuruList />}
          ></Route>
          <Route
            path={"/admin-dashboard/add-guru"}
            element={<AddGuru />}
          ></Route>
          <Route
            path={"/admin-dashboard/guru-guru/:id"}
            element={<View />}
          ></Route>
          <Route
            path={"/admin-dashboard/guru-guru/edit/:id"}
            element={<Edit />}
          ></Route>

          {/* SISWA */}
          <Route
            path={"/admin-dashboard/students"}
            element={<StudentList />}
          ></Route>
          <Route
            path={"/admin-dashboard/add-studentFace/:id"}
            element={<CameraButton />}
          ></Route>

          {/* SETTING */}
          <Route
            path={"/admin-dashboard/setting/ubahPass"}
            element={<UbahPass />}
          ></Route>
          <Route
            path={"/admin-dashboard/profile/:id"}
            element={<Profile />}
          ></Route>
          <Route
            path={"/admin-dashboard/profile/edit/:id"}
            element={<EditProfile />}
          ></Route>
          <Route
            path={"/admin-dashboard/initGallery"}
            element={<InitGalleryButton />}
          ></Route>

          {/* REPORT */}
          <Route path={"/admin-dashboard/report"} element={<Report />}></Route>
          <Route
            path={"/admin-dashboard/report/:roomId"}
            element={<ReportDetail />}
          ></Route>
        </Route>

        {/* GURU */}
        <Route
          path="/guru-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoute requiredRole={["admin", "guru"]}>
                <GuruDashboard />
              </RoleBaseRoute>
            </PrivateRoutes>
          }
        >
          <Route index element={<UserDashboard />}></Route>
          <Route
            path="/guru-dashboard/profile/:id"
            element={<Profile />}
          ></Route>
          <Route
            path={"/guru-dashboard/profile/edit/:id"}
            element={<EditProfile />}
          ></Route>
          <Route
            path={"/guru-dashboard/setting/ubahPass"}
            element={<UbahPass />}
          ></Route>
          <Route
            path={"/guru-dashboard/guru-schedule"}
            element={<GuruSchedule />}
          ></Route>
          <Route
            path={"/guru-dashboard/presensi"}
            element={<Presensi />}
          ></Route>
          <Route
            path={"/guru-dashboard/presensi/edit"}
            element={<EditPresensi />}
          ></Route>
          <Route
            path="/guru-dashboard/presensi/:scheduleId"
            element={<FaceRecognition />}
          />
          <Route
            path="/guru-dashboard/presensi/confirm"
            element={<ConfirmPresensi />}
          />
          <Route
            path="/guru-dashboard/presensi/ubahPresensi"
            element={<UbahPresensi />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

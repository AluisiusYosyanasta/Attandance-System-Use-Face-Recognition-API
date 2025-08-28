import { StudentButtons } from "./StudentButtons.jsx";

export const getColumns = (onStudentDelete) => [
  {
    name: "S No",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.sno || "-"}</span>
      </div>
    ),
    width: "80px",
  },
  {
    name: "NIK",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.nik || "-"}</span>
      </div>
    ),
    width: "70px",
  },
  {
    name: "Nama",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.name || "-"}</span>
      </div>
    ),
    sortable: true,
    width: "200px",
  },

  {
    name: "Gender",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.gender || "-"}</span>
      </div>
    ),
    sortable: true,
    width: "100px",
  },
  {
    name: "Kelas",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.room_cls || "-"}</span>
      </div>
    ),
    sortable: true,
    width: "100px",
  },
  {
    name: "Wajah Siswa",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">
          {row.faceEnrolled ? "Ada" : "Belum ada"}
        </span>
      </div>
    ),
    width: "120px",
  },
  {
    name: "Action",
    cell: (row) => (
      <div className="flex justify-center items-center gap-2">
        <StudentButtons _id={row._id} onStudentDelete={onStudentDelete} />
      </div>
    ),
    width: "180px",
  },
];

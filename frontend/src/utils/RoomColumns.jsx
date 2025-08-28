import { RoomButtons } from "./RoomButtons.jsx";

export const getColumns = (onRoomDelete) => [
  {
    name: "Tahun Ajaran",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.school_year || "-"}</span>
      </div>
    ),
    width: "125px",
  },
  {
    name: "Kelas",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.room_name || "-"}</span>
      </div>
    ),
    width: "70px",
  },
  {
    name: "Jenjang Pendidikan",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.edu_level || "-"}</span>
      </div>
    ),
    sortable: true,
    width: "190px",
  },
  {
    name: "Wali Kelas",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">
          {row.guruId?.userId?.name || "Tidak Ada Wali Kelas"}
        </span>
      </div>
    ),
  },
  {
    name: "Action",
    cell: (row) => (
      <div className="flex justify-center items-center gap-2">
        <RoomButtons _id={row._id} onRoomDelete={onRoomDelete} />
      </div>
    ),
    width: "270px",
  },
];

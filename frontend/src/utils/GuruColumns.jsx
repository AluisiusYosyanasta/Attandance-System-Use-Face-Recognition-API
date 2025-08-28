import { GuruButtons } from "./GuruButtons";

export const getColumns = (onGuruDelete) => [
  {
    name: "S No",
    selector: (row) => row.sno,
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.sno ?? "-"}</span>
      </div>
    ),
    width: "70px",
  },
  {
    name: "Foto",
    width: "150px",
    selector: (row) => row.profileImage,
  },
  {
    name: "Nama Guru",
    cell: (row) => (
      <div className="w-full text-left">
        <span className="font-medium">
          {row.guruId || "-"} - {row.userId.name || "-"}
        </span>
      </div>
    ),
    sortable: true,
  },
  {
    name: "Ijazah Terakhir",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.title || "-"}</span>
      </div>
    ),
    width: "150px",
  },
  {
    name: "Tempat & Tanggal Lahir",
    cell: (row) => {
      const formattedDob = row.dob
        ? new Date(row.dob).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "-";

      const placeAndDate = row.dob_city
        ? `${row.dob_city} - ${formattedDob}`
        : formattedDob;

      return (
        <div className="w-full text-center">
          <span className="font-medium">{placeAndDate}</span>
        </div>
      );
    },
  },
  {
    name: "Jabatan",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.position || "-"}</span>
      </div>
    ),
  },
  {
    name: "Bidang Studi",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">
          {Array.isArray(row.subject) && row.subject.length > 0
            ? row.subject.map((s) => s?.sub_name).join(", ")
            : "-"}
        </span>
      </div>
    ),
  },
  {
    name: "Wali Kelas",
    cell: (row) => {
      const waliKelas =
        row.rooms && row.rooms.length > 0
          ? row.rooms.map((room) => room?.room_name || "-").join(", ")
          : "-";

      return (
        <div className="w-full text-center">
          <span className="font-medium">{waliKelas}</span>
        </div>
      );
    },
  },
  {
    name: "Action",
    cell: (row) => (
      <div className="flex justify-center items-center gap-2">
        <GuruButtons _id={row._id} onGuruDelete={onGuruDelete} />
      </div>
    ),
    width: "270px",
  },
];

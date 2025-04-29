import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";

// Demo data for dashboard testing
const DEMO_VIDEOS = [
  {
    _id: "6588d12c9f3aeb7f2a724a82",
    title: "How to Build a React Application from Scratch",
    description:
      "In this comprehensive tutorial, I walk through the complete process of building a modern React application...",
    thumbnailUrl: "https://picsum.photos/id/1/200/120",
    creatorName: "DevMaster",
    isAproved: false,
    createdAt: "2025-04-15T14:32:11Z",
  },
  {
    _id: "6588d12c9f3aeb7f2a724a83",
    title: "Advanced CSS Techniques for Modern Web Design",
    description:
      "Learn the latest CSS techniques including Grid, Flexbox, and CSS variables to create stunning layouts...",
    thumbnailUrl: "https://picsum.photos/id/20/200/120",
    creatorName: "CSSWizard",
    isAproved: true,
    createdAt: "2025-04-14T09:22:37Z",
  },
  {
    _id: "6588d12c9f3aeb7f2a724a84",
    title: "JavaScript Performance Optimization",
    description:
      "Discover advanced techniques for optimizing your JavaScript code for better performance and smoother UX...",
    thumbnailUrl: "https://picsum.photos/id/48/200/120",
    creatorName: "JSPerformance",
    isAproved: true,
    createdAt: "2025-04-13T11:45:23Z",
  },
  {
    _id: "6588d12c9f3aeb7f2a724a85",
    title: "Building Microservices with Node.js",
    description:
      "A step-by-step guide to building scalable and maintainable microservices architecture with Node.js...",
    thumbnailUrl: "https://picsum.photos/id/42/200/120",
    creatorName: "NodeMaster",
    isAproved: false,
    createdAt: "2025-04-12T16:32:11Z",
  },
  {
    _id: "6588d12c9f3aeb7f2a724a86",
    title: "Introduction to TypeScript",
    description:
      "Learn the fundamentals of TypeScript and how it can improve your JavaScript development workflow...",
    thumbnailUrl: "https://picsum.photos/id/180/200/120",
    creatorName: "TypeMaster",
    isAproved: false,
    createdAt: "2025-04-11T08:12:44Z",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [uploadVideoModel, setUploadVideoModel] = useState(false);
  //   title, description, url, thumbnailUrl, creatorId

  const getData = async () => {
    try {
      setLoading(true);

      // For demo purposes - use the demo data
      if (
        process.env.NODE_ENV === "development" ||
        !import.meta.env.VITE_API_URL
      ) {
        setTimeout(() => {
          setVideos(DEMO_VIDEOS);
          setIsDemo(true);
          setLoading(false);
        }, 800); // Simulate API delay
        return;
      }

      const res = await axios.get<RowData[]>(
        `${import.meta.env.VITE_API_URL}/video/videos`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        setVideos(res.data);
      } else {
        setError("Error fetching data: " + res.statusText);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        // Fallback to demo data if API fails in development
        setTimeout(() => {
          setVideos(DEMO_VIDEOS);
          setIsDemo(true);
          setLoading(false);
        }, 800);
        return;
      }
      setError("Error fetching data: " + (error as Error).message);
    } finally {
      if (!isDemo) setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  interface RowData {
    _id: string;
    thumbnailUrl: string;
    title: string;
    description: string;
    creatorName: string;
    isAproved: boolean;
    createdAt: string;
  }

  const handleRowClick = (row: RowData) => {
    navigate(`/video/${row._id}`);
  };

  // Filter the data based on search term and status filter
  const filteredData = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.creatorName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "approved") return matchesSearch && video.isAproved;
    if (filterStatus === "pending") return matchesSearch && !video.isAproved;

    return matchesSearch;
  });

  const columns: TableColumn<RowData>[] = [
    {
      name: "Thumbnail",
      cell: (row: RowData) => (
        <div className="py-2">
          <img
            src={row.thumbnailUrl}
            alt={`Thumbnail for ${row.title}`}
            className="w-24 h-16 object-cover rounded"
          />
        </div>
      ),
      width: "120px",
    },
    {
      name: "Title",
      selector: (row: RowData) => row.title,
      sortable: true,
      cell: (row: RowData) => (
        <div className="py-2">
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {row.description}
          </div>
        </div>
      ),
      grow: 3,
    },
    {
      name: "Creator",
      selector: (row: RowData) => row.creatorName,
      sortable: true,
      width: "130px",
    },
    {
      name: "Status",
      selector: (row: RowData) => (row.isAproved ? "Approved" : "Pending"),
      sortable: true,
      cell: (row: RowData) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isAproved
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.isAproved ? "Approved" : "Pending"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Date",
      selector: (row: RowData) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row: RowData) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/video/${row._id}`);
            }}
            className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {!row.isAproved && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // You could implement quick approve here
                // For demo, we'll just // console.log
                // console.log("Quick approve:", row._id);
              }}
              className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      ),
      width: "100px",
      ignoreRowClick: true,
    },
  ];

  // Custom styles for DataTable
  const customStyles = {
    table: {
      style: {
        backgroundColor: "white",
        borderRadius: "0.5rem",
        overflow: "hidden",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f9fafb",
        color: "#374151",
        borderBottomWidth: "1px",
        borderBottomColor: "#e5e7eb",
        fontWeight: "600",
        minHeight: "56px",
      },
    },
    rows: {
      style: {
        minHeight: "72px",
        fontSize: "0.875rem",
        color: "#1f2937",
        "&:hover": {
          backgroundColor: "#f3f4f6",
          cursor: "pointer",
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: "white",
        color: "#374151",
        borderTopWidth: "1px",
        borderTopColor: "#e5e7eb",
      },
      pageButtonsStyle: {
        color: "#4b5563",
        fill: "#4b5563",
        "&:hover:not(:disabled)": {
          backgroundColor: "#f3f4f6",
        },
        "&:focus": {
          outline: "none",
          backgroundColor: "#e5e7eb",
        },
      },
    },
  };

  interface UploadVideoData {
    title: string;
    description: string;
    url: File | null;
    thumbnail: File | null;
    thumbnailUrl?: string; // Optional property
  }

  const [uploadVideoData, setUploadVideoData] = useState<UploadVideoData>({
    title: "",
    description: "",
    url: null,
    thumbnail: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setUploadVideoData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
    // console.log("uploadVideoData : ", uploadVideoData);
  };

  const handleValidateData = () => {
    if (!uploadVideoData.title || !uploadVideoData.description || !uploadVideoData.url || !uploadVideoData.thumbnail) {
      setError("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const handleUploadVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    try {

      if (!handleValidateData()) return;
      e.preventDefault(); 
      const formData = new FormData();
      formData.append("title", uploadVideoData.title);
      formData.append("description", uploadVideoData.description);
      formData.append("url", uploadVideoData.url as Blob);
      formData.append("thumbnailUrl", uploadVideoData.thumbnail as Blob);
      formData.append("creatorId", "680b64fa8923a34a3d8ba431");

      // console.log("uploadVideoData from Post : ", formData);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/video/upload`,
        formData,
        { withCredentials: true }
      );

      if (res.status === 200) {
        // console.log("Video uploaded successfully:", res.data);
        getData();
      } else {
        setError("Error uploading video: " + res.statusText);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      setError("An error occurred while uploading the video.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  <span className="font-medium">Demo Mode:</span> Using sample
                  data. API calls are simulated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            YouTube Video Management
          </h1>
          <p className="text-gray-600 mt-1">
            Review, approve and manage uploaded videos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-700 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Videos</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {videos.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-700 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {videos.filter((video) => video.isAproved).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-700 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending Approval</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {videos.filter((video) => !video.isAproved).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search videos..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex space-x-4">
              <div className="relative flex-1">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Videos</option>
                  <option value="approved">Approved Only</option>
                  <option value="pending">Pending Only</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  getData();
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Reset
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end mb-4 ">
          <h1>
            <button
              className="bg-blue-800 p-1.5 rounded text-white font-bold text-right"
              onClick={() => setUploadVideoModel(true)}
            >
              Upload Video
            </button>
          </h1>
        </div>
        uploadVideoModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Upload New Video
            </h3>
            <button
              onClick={() => setUploadVideoModel(false)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleUploadVideo} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter video title"
                  onChange={handleChange} // Pass directly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter video description"
                  onChange={handleChange} // Pass directly
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Video
                </label>
                <input
                  type="file"
                  name="url"
                  accept="video/*"
                  onChange={handleChange}
                  className="..."
                  required
                />

                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleChange}
                  className="..."
                  required
                />
              </div>

              {/* Other fields */}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setUploadVideoModel(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Upload Video
              </button>
            </div>
          </form>
        </div>
      </div>
        )

        {/* Data Table */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 bg-gray-200 rounded w-full"
                ></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
            onRowClicked={handleRowClick}
            customStyles={customStyles}
            noDataComponent={
              <div className="p-8 text-center">
                <p className="text-gray-500">No videos found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            }
            progressPending={loading}
            persistTableHead
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

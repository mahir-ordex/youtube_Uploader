import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";


const Video = () => {
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<any>(null);
    const location = window.location.pathname.split("/").slice(1).join(" > ");

    const getVideo = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/video/${id}`, { withCredentials: true });
            if (res.status === 200) {
                setVideo(res.data);
            } else {
                console.error("Error fetching video:", res.statusText);
            }
        } catch (error) {
            console.error("Error fetching video:", error);
        }
    };

    useEffect(() => {
        getVideo();
    }, []);

    return (
        <>
        <div>
            <h1>Dashboard {">>>"} {location}</h1>

        </div>
        <div>
            <h3>{video?.title}</h3>
            <p>
                {video?.description}
            </p>
            <img src={video.thumbnail} alt="Thumbnail" />

            <div>
                {video.status === "pending" ? (
                    <div>
                        <p>Videos Status is Pending !!</p>
                        <button>Approve</button>
                        <button>Reject</button>
                    </div>
                ) : (
                    <p>Videos Status is {video.status} !!</p>)}
            </div>


        </div>
        </>

    )

}

export default Video;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../../components/MovieCard";
import { getMovies } from "../../services/movieService";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "./Home.css";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return <p className="loading-text">Loading Movies...</p>;

  const nowShowing = movies.filter((m) => m.status === "now");
  const comingSoon = movies.filter((m) => m.status === "soon");

  // Hero banner movies
  const heroMovies = nowShowing.filter((m) => m.bannerUrl || m.posterUrl);

  return (
    <div className="movie-home">
      {/* HERO SLIDER */}
      <Swiper
        modules={[Autoplay]}
        loop
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        slidesPerView={1}
        className="hero-swiper"
      >
        {heroMovies.map((movie) => (
          <SwiperSlide key={movie._id}>
            <div className="hero-slide">
              <img
                src={
                  Array.isArray(movie.bannerUrl)
                    ? movie.bannerUrl[0]
                    : movie.bannerUrl || movie.posterUrl
                }
                alt={movie.title}
                className="hero-slide-img"
              />
              <div className="hero-vignette" />

              <div className="hero-overlay">
                <div className="hero-tags">
                  <span className="tag gold">⭐ {movie.rating || "8.8"}</span>
                  <span className="tag red">FEATURED</span>
                </div>

                <h1 className="hero-title">{movie.title}</h1>
                <p className="hero-genre">
                  {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre} •{" "}
                  {movie.duration || "120"} mins
                </p>

                <div className="hero-actions">
                  <button
                    className="btn-hero primary"
                    onClick={() => navigate(`/buy-tickets/${movie._id}`)}
                  >
                    🎟️ Book Tickets
                  </button>
                  <button
                    className="btn-hero secondary"
                    onClick={() => navigate(`/movies/${movie._id}`)}
                  >
                    ▶ View Details
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* NOW SHOWING Section */}
      <section className="slider-section">
        <h2 className="section-title">
          <span className="title-icon">🎬</span> Now Showing
        </h2>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={24}
          breakpoints={{
            320: { slidesPerView: 1.2 },
            600: { slidesPerView: 2.2 },
            900: { slidesPerView: 3.2 },
            1200: { slidesPerView: 4.2 },
          }}
        >
          {nowShowing.map((movie) => (
            <SwiperSlide key={movie._id}>
              <MovieCard movie={movie} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* COMING SOON Section */}
      <section className="slider-section">
        <h2 className="section-title">
          <span className="title-icon">🔥</span> Coming Soon
        </h2>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={24}
          breakpoints={{
            320: { slidesPerView: 1.2 },
            600: { slidesPerView: 2.2 },
            900: { slidesPerView: 3.2 },
            1200: { slidesPerView: 4.2 },
          }}
        >
          {comingSoon.map((movie) => (
            <SwiperSlide key={movie._id}>
              <MovieCard movie={movie} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
};

export default Home;

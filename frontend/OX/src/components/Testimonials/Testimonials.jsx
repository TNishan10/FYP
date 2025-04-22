import React from "react";
import Slider from "react-slick";

const TestimonialData = [
  {
    id: 1,
    name: "Lønewølf NT",
    text: "Welcome to The First Powerlifting Gym of Nepal. The only gym with multiple combo racks, power rack and deadlift platform. Not only made for elite athletes but they also provide multiple group classes for functional training, cross-fit, powerlifting and olympic weightlifting for Beginners as-well. Train here with the best lifters, coaches and surround yourself with the utmost friendly environment.",
    img: "https://picsum.photos/101/101",
  },
  {
    id: 2,
    name: "Shrestha Kajari",
    text: "Best gym with top-tier equipment, calibrated plates, competition-grade barbells, and excellent cardio machines. The vibe is always positive, clean, and hygienic, and the coaches are super supportive and motivating. Perfect place to push your limits and achieve your fitness goals. 100% recommended.",
    img: "https://picsum.photos/102/102",
  },
  {
    id: 3,
    name: "SAMPEL MOKTAN",
    text: "KTM best gym guaranteed! They got what you need to a tee, whether you are a starter or an old athlete looking to get back in shape. A1 facility. Weights options felt unlimited they got it all. They carry variety of barbells, today I can say I lifted the best barbell to this day (worldwide) showed how standard equipment feels.",
    img: "https://picsum.photos/104/104",
  },
  {
    id: 4,
    name: "Tyson MOKTAN",
    text: "The gym feels brand new till this day great housekeeping done by the staff cleannesses 10/10. Music choices was great (I forgot my headphones). PT options / group classes looked fun! Will definitely look forward to those options next time I visit! Nepal training facility standard raised by OX STRENGTH TRAINING GROUND!",
    img: "https://picsum.photos/105/105",
  },
  {
    id: 5,
    name: "Zenisha Moktan",
    text: "Love this place... the coaches, equipment, space and community is like no other 🔥 7 months in and I feel stronger and happier than ever... Programming for CrossFit classes is top notch.. learning everyday.. thanks Team OX.",
    img: "https://picsum.photos/103/103",
  },
  {
    id: 6,
    name: "Bryan Surfie",
    text: "Awesome gym with dedicated instructors! Training here feels like being part of a family. The facility is clean and well-equipped — a great environment to stay motivated and push your limits.",
    img: "https://picsum.photos/106/106",
  },
  {
    id: 7,
    name: "Chanda Rana",
    text: "Ox Strength Training Ground is the ultimate destination for fitness lovers! Whether you're powerlifting athlete, sweating it out with cross-training, or sharpening your functional strength, this state-of-the-art facility has everything you could dream of. The expert team of coaches and trainers doesn't just guide you—they inspire you to push limits strategically!",
    img: "https://picsum.photos/107/107",
  },
  {
    id: 8,
    name: "Sonu Rana",
    text: "For powerlifting athletes like me, it's a haven where dreams are forged into reality. Every little detail, from the cutting-edge equipment to the seamless logistics, is planned to perfection, making every training session a masterpiece. And let's not forget the cherry on top—Samaya Café. This cozy hangout isn't just about coffee; it's a barista-crafted blend of energy, warmth, and community that keeps you coming back for more. Training here isn't just a workout—it's a lifestyle upgrade!",
    img: "https://picsum.photos/107/107",
  },
  {
    id: 9,
    name: "utkarsh shrestha",
    text: "Ox Strength Training Ground is hands down the best gym for serious training. The facility is always clean, the equipment is top-notch, and the coaches are highly knowledgeable. Their commitment to service is outstanding, creating an environment where everyone feels supported and motivated. If you're looking for a gym that truly prioritizes strength, growth, and community, this is the place to be!",
    img: "https://picsum.photos/108/108",
  },
  {
    id: 10,
    name: "Utsah Pandey",
    text: "Best training center for all level of fitness and interest in kathmandu. Functional fitness, powerlifting, Olympic weightlifting, Crossfit - all modes of training under one roof. Led by the best athletes and coaches. The environment is very welcoming to people of all fitness levels from beginners to athletes. Reasonable prices for such great service. Strongly recommended! You are one step away from your most athletic self.",
    img: "https://picsum.photos/109/109",
  },
  {
    id: 11,
    name: "Tricia Cherise",
    text: "This place is just perfect for me. Exactly what I was looking for. They have a great selection of equipment that is new or like new. The place is very clean and the staff is extremely helpful. I will come here as much as I can because if I'm having a down day the vibe in this place is exactly the thing to uplift and motivate a person.",
    img: "https://picsum.photos/110/110",
  },
  {
    id: 12,
    name: "Manjari Devkota",
    text: "Great atmosphere, super helpful & encouraging coaches! Special out shout to Nishan coach ⭐️",
    img: "https://picsum.photos/111/111",
  },
  {
    id: 13,
    name: "Ritu Karki",
    text: "Got a place for workout where exercise seems FUN AND SUPER EXCITING..!!!!amazing place for functional training and strength building. Its like everyday I am learning something NEW couldn't wait to go OX STRENGTH every day:) P.S. team has creative teaching skills👏",
    img: "https://picsum.photos/112/112",
  },
  {
    id: 14,
    name: "Dave de Wit",
    text: "Joined for a Sunday morning drop-in and it was awesome. Great workout, coaching & facilities. Afterwards we had a lovely coffee with the other participants and coaches showing the great community they're having. Thank you for having us!",
    img: "https://picsum.photos/113/113",
  },
  {
    id: 15,
    name: 'kylian "MrxGhost10" grossemy',
    text: "French powerlifter. The best gym in Nepal. Stuff is very good and people are very kind. I recommend this gym to everyone.",
    img: "https://picsum.photos/114/114",
  },
];

const Testimonials = () => {
  var settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "linear",
    pauseOnHover: true,
    pauseOnFocus: true,
    responsive: [
      {
        breakpoint: 10000,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="py-10 mb-10">
      <div className="container">
        {/* header section */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p data-aos="fade-up" className="text-sm text-primary">
            What our customers are saying
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            Testimonials
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            Real reviews from our members at OX Strength Training Ground
          </p>
        </div>

        {/* Testimonial cards */}
        <div data-aos="zoom-in">
          <Slider {...settings}>
            {TestimonialData.map((data) => (
              <div key={data.id} className="my-6">
                <div className="flex flex-col gap-4 shadow-lg py-8 px-6 mx-4 rounded-xl dark:bg-gray-800 bg-primary/10 relative">
                  <div className="mb-4">
                    <img
                      src={data.img}
                      alt={`${data.name}'s review`}
                      className="rounded-full w-20 h-20 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/100";
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500">{data.text}</p>
                      <h1 className="text-xl font-bold text-black/80 dark:text-light">
                        {data.name}
                      </h1>
                      <div className="flex gap-1">
                        <span className="text-yellow-500">★★★★★</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-black/20 text-9xl font-serif absolute top-0 right-0">
                    ,,
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;

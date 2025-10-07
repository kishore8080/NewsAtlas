async rewrites() {
  return [
    {
      source: "/quiz/:path*",
      destination: "http://backend-service:8000/quiz/:path*",
    },
  ];
}

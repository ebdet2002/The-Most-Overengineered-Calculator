FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    g++ \
    cmake \
    wget \
    libboost-all-dev

WORKDIR /app

# Download Crow single header
RUN wget https://github.com/CrowCpp/Crow/releases/download/v1.0+5/crow_all.h

COPY main.cpp .

# Compile
RUN g++ main.cpp -o add_service -lpthread

EXPOSE 8080

CMD ["./add_service"]

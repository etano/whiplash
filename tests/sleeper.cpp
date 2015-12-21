#include "rapidjson/document.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"
#include <iostream>
#include <string>
#include <fstream>
#include <streambuf>
#include <unistd.h>
#include <cassert>
#include <sys/time.h>

int main(int argc, char* argv[])
{
    assert(argc > 1);
    const std::string file_name(argv[1]);

    std::ifstream in(file_name);
    std::string json((std::istreambuf_iterator<char>(in)),std::istreambuf_iterator<char>());

    rapidjson::Document doc;
    doc.Parse(json.c_str());

    const char* result_str = "{\"content\":{\"time\":0},\"tags\":{\"some\":\"tags\"}}";
    rapidjson::Document result;
    result.Parse(result_str);

    struct timeval tim;
    gettimeofday(&tim, NULL);
    usleep(2.0e06);

    result["content"]["time"] = int(tim.tv_sec);

    std::cerr << "here is an error" << std::endl;
    std::cout << "here is an output" << std::endl;

    rapidjson::StringBuffer buffer;
    rapidjson::Writer<rapidjson::StringBuffer> writer(buffer);
    result.Accept(writer);

    std::ofstream out(file_name);
    out << buffer.GetString();
    out.close();

    return 0;
}

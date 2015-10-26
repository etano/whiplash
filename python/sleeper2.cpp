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
    std::string json;
    std::cin >> json;

    rapidjson::Document doc;
    doc.Parse(json.c_str());

    const char* result_str = "{\"time\":0}";
    rapidjson::Document result;
    result.Parse(result_str);

    struct timeval tim;
    gettimeofday(&tim, NULL);

    usleep(2.0e06);

    result["time"] = int(tim.tv_sec);

    rapidjson::StringBuffer buffer;
    rapidjson::Writer<rapidjson::StringBuffer> writer(buffer);
    result.Accept(writer);
    std::cout << buffer.GetString();

    return 0;
}

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

    struct timeval tim0;
    gettimeofday(&tim0, NULL);

    while(true){
        struct timeval tim1;
        gettimeofday(&tim1, NULL);
        if(tim1.tv_sec-tim0.tv_sec > 2.0)
            break;
    }

    result["time"] = int(tim0.tv_sec);

    rapidjson::StringBuffer buffer;
    rapidjson::Writer<rapidjson::StringBuffer> writer(buffer);
    result.Accept(writer);
    std::cout << buffer.GetString();

    return 0;
}



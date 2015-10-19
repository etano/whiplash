#include "rapidjson/document.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"
#include <iostream>
#include <string>
#include <fstream>
#include <streambuf>
#include <unistd.h>

int main(int argc, char* argv[])
{
    const std::string file_name(argv[1]);

    std::cout << "client starting: " << file_name << std::endl;

    usleep(0.5e06);

    std::cout << "client done" << std::endl;

    std::ifstream in(file_name);
    std::string json((std::istreambuf_iterator<char>(in)),std::istreambuf_iterator<char>());

    rapidjson::Document doc;
    doc.Parse(json.c_str());

    const char* result_str = "{\"number\":8}";
    rapidjson::Document result;
    result.Parse(result_str);

    rapidjson::StringBuffer buffer;
    rapidjson::Writer<rapidjson::StringBuffer> writer(buffer);
    result.Accept(writer);

    std::ofstream out(file_name);
    out << buffer.GetString();
    out.close();

    return 0;
}

#include <gtest/gtest.h>
#include "BitConverterTests.h"
#include "common/Connection.h"

#include <QtCore>

int main(int argc, char **argv)
{
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}

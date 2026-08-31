using System;

class Addition
{
    static int Add(int a, int b)
    {
        return a + b;
    }

    static void Main()
    {
        int num1 = 10;
        int num2 = 5;
        Console.WriteLine($"C# Addition: {num1} + {num2} = {Add(num1, num2)}");
    }
}

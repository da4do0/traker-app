using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api.Converters
{
    public class FlexibleIntConverter : JsonConverter<int?>
    {
        public override int? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            switch (reader.TokenType)
            {
                case JsonTokenType.Number:
                    return reader.GetInt32();
                
                case JsonTokenType.String:
                    var stringValue = reader.GetString();
                    if (int.TryParse(stringValue, out var intValue))
                        return intValue;
                    return null;
                
                case JsonTokenType.Null:
                    return null;
                
                default:
                    throw new JsonException($"Cannot convert {reader.TokenType} to int");
            }
        }

        public override void Write(Utf8JsonWriter writer, int? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteNumberValue(value.Value);
            else
                writer.WriteNullValue();
        }
    }

    // Versione non-nullable se preferisci
    public class FlexibleIntConverterNonNullable : JsonConverter<int>
    {
        public override int Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            switch (reader.TokenType)
            {
                case JsonTokenType.Number:
                    return reader.GetInt32();
                
                case JsonTokenType.String:
                    var stringValue = reader.GetString();
                    if (int.TryParse(stringValue, out var intValue))
                        return intValue;
                    return 0; // valore di default
                
                default:
                    return 0; // valore di default
            }
        }

        public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options)
        {
            writer.WriteNumberValue(value);
        }
    }
}
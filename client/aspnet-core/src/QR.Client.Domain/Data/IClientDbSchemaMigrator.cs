using System.Threading.Tasks;

namespace QR.Client.Data;

public interface IClientDbSchemaMigrator
{
    Task MigrateAsync();
}

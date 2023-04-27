using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace QR.Client.Data;

/* This is used if database provider does't define
 * IClientDbSchemaMigrator implementation.
 */
public class NullClientDbSchemaMigrator : IClientDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}

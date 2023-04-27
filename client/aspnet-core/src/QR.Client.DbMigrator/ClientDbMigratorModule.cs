using QR.Client.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace QR.Client.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(ClientEntityFrameworkCoreModule),
    typeof(ClientApplicationContractsModule)
    )]
public class ClientDbMigratorModule : AbpModule
{

}

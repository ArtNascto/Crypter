using QR.Client.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace QR.Client;

[DependsOn(
    typeof(ClientEntityFrameworkCoreTestModule)
    )]
public class ClientDomainTestModule : AbpModule
{

}

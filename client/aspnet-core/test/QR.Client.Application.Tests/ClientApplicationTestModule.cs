using Volo.Abp.Modularity;

namespace QR.Client;

[DependsOn(
    typeof(ClientApplicationModule),
    typeof(ClientDomainTestModule)
    )]
public class ClientApplicationTestModule : AbpModule
{

}

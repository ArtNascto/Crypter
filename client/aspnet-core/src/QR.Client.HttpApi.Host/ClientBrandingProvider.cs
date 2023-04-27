using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace QR.Client;

[Dependency(ReplaceServices = true)]
public class ClientBrandingProvider : DefaultBrandingProvider
{
    public override string AppName => "Client";
}

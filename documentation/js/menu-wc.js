'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`<nav>
    <ul class="list">
        <li class="title">
            <a href="index.html" data-type="index-link">sistema-asadas documentation</a>
        </li>
        <li class="divider"></li>
        ${ isNormalMode ? `<div id="book-search-input" role="search">
    <input type="text" placeholder="Type to search">
</div>
` : '' }
        <li class="chapter">
            <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
            <ul class="links">
                    <li class="link">
                        <a href="overview.html" data-type="chapter-link">
                            <span class="icon ion-ios-keypad"></span>Overview
                        </a>
                    </li>
                    <li class="link">
                        <a href="index.html" data-type="chapter-link">
                            <span class="icon ion-ios-paper"></span>README
                        </a>
                    </li>
                    <li class="link">
                        <a href="dependencies.html"
                            data-type="chapter-link">
                            <span class="icon ion-ios-list"></span>Dependencies
                        </a>
                    </li>
            </ul>
        </li>
        <li class="chapter modules">
            <a data-type="chapter-link" href="modules.html">
                <div class="menu-toggler linked" data-toggle="collapse"
                    ${ isNormalMode ? 'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                    <span class="icon ion-ios-archive"></span>
                    <span class="link-name">Modules</span>
                    <span class="icon ion-ios-arrow-down"></span>
                </div>
            </a>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                    <li class="link">
                        <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-AppModule-9ab62599fa500c9da96153b9fc41eabb"' : 'data-target="#xs-components-links-module-AppModule-9ab62599fa500c9da96153b9fc41eabb"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-AppModule-9ab62599fa500c9da96153b9fc41eabb"' : 'id="xs-components-links-module-AppModule-9ab62599fa500c9da96153b9fc41eabb"' }>
                                        <li class="link">
                                            <a href="components/AboutUsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AboutUsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AddAsadaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddAsadaComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AddChlorinSystemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddChlorinSystemComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AddInfrastructureComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddInfrastructureComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AddNascentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddNascentComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AddSuperficialWaterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddSuperficialWaterComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AddTankComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddTankComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AdmUsuariosComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AdmUsuariosComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AsadaDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AsadaDetailsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/BitacoraComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">BitacoraComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ChlorinDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ChlorinDetailsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/CompareAsadasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">CompareAsadasComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/DashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DashboardComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/DetailsSuperficialWaterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DetailsSuperficialWaterComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/EvalSersaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">EvalSersaComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/FilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">FilterComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/GenerateReportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">GenerateReportComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/GraphicdetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">GraphicdetailsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/GraphicsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">GraphicsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/HeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">HeaderComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/HomeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">HomeComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/InfrastructureGalleryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfrastructureGalleryComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoginComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/MapGoogleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">MapGoogleComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/MenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">MenuComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/NascentDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">NascentDetailsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/NascentPickupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">NascentPickupComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/NewNotificationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">NewNotificationComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/NotFoundComponentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">NotFoundComponentComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/NotificationsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">NotificationsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/PersmissionRequestsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">PersmissionRequestsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProfileComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ProfileHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProfileHeaderComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ReporteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ReporteComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/SearchComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SearchComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/SignupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SignupComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/SurfacePickupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SurfacePickupComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/Tab.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">Tab</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/Tabs.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">Tabs</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/TankDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">TankDetailsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/TomaDatosComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">TomaDatosComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/TomaDatosInfraComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">TomaDatosInfraComponent</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/RoutingModule.html" data-type="entity-link">RoutingModule</a>
                    </li>
            </ul>
        </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
            ${ isNormalMode ? 'data-target="#classes-links"' : 'data-target="#xs-classes-links"' }>
                <span class="icon ion-ios-paper"></span>
                <span>Classes</span>
                <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                    <li class="link">
                        <a href="classes/Asada.html" data-type="entity-link">Asada</a>
                    </li>
                    <li class="link">
                        <a href="classes/AsadaForm.html" data-type="entity-link">AsadaForm</a>
                    </li>
                    <li class="link">
                        <a href="classes/AsadaTotal.html" data-type="entity-link">AsadaTotal</a>
                    </li>
                    <li class="link">
                        <a href="classes/Chlorination.html" data-type="entity-link">Chlorination</a>
                    </li>
                    <li class="link">
                        <a href="classes/DistributionLine.html" data-type="entity-link">DistributionLine</a>
                    </li>
                    <li class="link">
                        <a href="classes/DrivingDistributionLine.html" data-type="entity-link">DrivingDistributionLine</a>
                    </li>
                    <li class="link">
                        <a href="classes/Evaluation.html" data-type="entity-link">Evaluation</a>
                    </li>
                    <li class="link">
                        <a href="classes/FirebaseImg.html" data-type="entity-link">FirebaseImg</a>
                    </li>
                    <li class="link">
                        <a href="classes/FormularioSersa.html" data-type="entity-link">FormularioSersa</a>
                    </li>
                    <li class="link">
                        <a href="classes/FromChlorin.html" data-type="entity-link">FromChlorin</a>
                    </li>
                    <li class="link">
                        <a href="classes/Graphic.html" data-type="entity-link">Graphic</a>
                    </li>
                    <li class="link">
                        <a href="classes/Historial.html" data-type="entity-link">Historial</a>
                    </li>
                    <li class="link">
                        <a href="classes/IncidenteTotal.html" data-type="entity-link">IncidenteTotal</a>
                    </li>
                    <li class="link">
                        <a href="classes/InfraTipo.html" data-type="entity-link">InfraTipo</a>
                    </li>
                    <li class="link">
                        <a href="classes/Nascent.html" data-type="entity-link">Nascent</a>
                    </li>
                    <li class="link">
                        <a href="classes/NascentForm.html" data-type="entity-link">NascentForm</a>
                    </li>
                    <li class="link">
                        <a href="classes/Notification.html" data-type="entity-link">Notification</a>
                    </li>
                    <li class="link">
                        <a href="classes/NotificationForm.html" data-type="entity-link">NotificationForm</a>
                    </li>
                    <li class="link">
                        <a href="classes/RadioOption.html" data-type="entity-link">RadioOption</a>
                    </li>
                    <li class="link">
                        <a href="classes/RolAccess.html" data-type="entity-link">RolAccess</a>
                    </li>
                    <li class="link">
                        <a href="classes/SuperficialForm.html" data-type="entity-link">SuperficialForm</a>
                    </li>
                    <li class="link">
                        <a href="classes/SuperficialWater.html" data-type="entity-link">SuperficialWater</a>
                    </li>
                    <li class="link">
                        <a href="classes/Tank.html" data-type="entity-link">Tank</a>
                    </li>
                    <li class="link">
                        <a href="classes/TankForm.html" data-type="entity-link">TankForm</a>
                    </li>
                    <li class="link">
                        <a href="classes/TankQG.html" data-type="entity-link">TankQG</a>
                    </li>
                    <li class="link">
                        <a href="classes/TomaDatos.html" data-type="entity-link">TomaDatos</a>
                    </li>
                    <li class="link">
                        <a href="classes/TomaInfra.html" data-type="entity-link">TomaInfra</a>
                    </li>
                    <li class="link">
                        <a href="classes/Upload.html" data-type="entity-link">Upload</a>
                    </li>
                    <li class="link">
                        <a href="classes/User.html" data-type="entity-link">User</a>
                    </li>
                    <li class="link">
                        <a href="classes/UserForm.html" data-type="entity-link">UserForm</a>
                    </li>
                    <li class="link">
                        <a href="classes/inputText.html" data-type="entity-link">inputText</a>
                    </li>
                    <li class="link">
                        <a href="classes/pkAsada.html" data-type="entity-link">pkAsada</a>
                    </li>
            </ul>
        </li>
                <li class="chapter">
                    <div class="simple menu-toggler" data-toggle="collapse"
                        ${ isNormalMode ? 'data-target="#injectables-links"' : 'data-target="#xs-injectables-links"' }>
                        <span class="icon ion-md-arrow-round-down"></span>
                        <span>Injectables</span>
                        <span class="icon ion-ios-arrow-down"></span>
                    </div>
                    <ul class="links collapse"
                    ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                            <li class="link">
                                <a href="injectables/AngularFireService.html" data-type="entity-link">AngularFireService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/DashboardService.html" data-type="entity-link">DashboardService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/ExportService.html" data-type="entity-link">ExportService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/FormsSersaService.html" data-type="entity-link">FormsSersaService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/GeolocationService.html" data-type="entity-link">GeolocationService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/GetEvalSersaService.html" data-type="entity-link">GetEvalSersaService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/GetUserDetailsService.html" data-type="entity-link">GetUserDetailsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/GraphicsService.html" data-type="entity-link">GraphicsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/LocationsService.html" data-type="entity-link">LocationsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/MapGoogleService.html" data-type="entity-link">MapGoogleService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/NewNotificationService.html" data-type="entity-link">NewNotificationService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/NotificationsService.html" data-type="entity-link">NotificationsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/SearchService.html" data-type="entity-link">SearchService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/SearchService-1.html" data-type="entity-link">SearchService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/SearchService-2.html" data-type="entity-link">SearchService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/StorageFirebaseService.html" data-type="entity-link">StorageFirebaseService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/TankDetailsService.html" data-type="entity-link">TankDetailsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/UploadService.html" data-type="entity-link">UploadService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/UserService.html" data-type="entity-link">UserService</a>
                            </li>
                    </ul>
                </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
                 ${ isNormalMode ? 'data-target="#guards-links"' : 'data-target="#xs-guards-links"' }>
            <span class="icon ion-ios-lock"></span>
            <span>Guards</span>
            <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
                ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                <li class="link">
                    <a href="guards/AuthGuard.html" data-type="entity-link">AuthGuard</a>
                </li>
            </ul>
            </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
                ${ isNormalMode ? 'data-target="#interfaces-links"' : 'data-target="#xs-interfaces-links"' }>
                <span class="icon ion-md-information-circle-outline"></span>
                <span>Interfaces</span>
                <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
            ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                    <li class="link">
                        <a href="interfaces/Graphics.html" data-type="entity-link">Graphics</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Infrastructure.html" data-type="entity-link">Infrastructure</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Notification.html" data-type="entity-link">Notification</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Notification-1.html" data-type="entity-link">Notification</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/asadastructure.html" data-type="entity-link">asadastructure</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/canton.html" data-type="entity-link">canton</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/distrito.html" data-type="entity-link">distrito</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/filterConfig.html" data-type="entity-link">filterConfig</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/filterParam.html" data-type="entity-link">filterParam</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/genericInfraestructure.html" data-type="entity-link">genericInfraestructure</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/locaciones.html" data-type="entity-link">locaciones</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/location.html" data-type="entity-link">location</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/provincia.html" data-type="entity-link">provincia</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/snitMapLayer.html" data-type="entity-link">snitMapLayer</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/snitMapLayerGroup.html" data-type="entity-link">snitMapLayerGroup</a>
                    </li>
            </ul>
        </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
            ${ isNormalMode ? 'data-target="#miscellaneous-links"' : 'data-target="#xs-miscellaneous-links"' }>
                <span class="icon ion-ios-cube"></span>
                <span>Miscellaneous</span>
                <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                    <li class="link">
                      <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                    </li>
            </ul>
        </li>
        <li class="chapter">
            <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
        </li>
        <li class="divider"></li>
        <li class="copyright">
                Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.svg" class="img-responsive" data-type="compodoc-logo">
                </a>
        </li>
    </ul>
</nav>`);
        this.innerHTML = tp.strings;
    }
});
